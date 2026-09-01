import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { doc, setDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { app, db, auth } from '../firebase.ts';

export interface AppNotification {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  type?: 'design' | 'palette' | 'system' | 'welcome';
  targetUrl?: string;
  userId?: string;
  createdAt?: any;
  read?: boolean;
}

let messagingInstance: Messaging | null = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

/**
 * Check if the current browser environment supports Web Push Notifications and Firebase Cloud Messaging
 */
export async function isMessagingSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;

  try {
    const supported = await isSupported();
    return supported;
  } catch (err) {
    console.warn('[FCM] Error checking messaging support:', err);
    return false;
  }
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Initialize or get Firebase Messaging instance
 */
export async function initFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  const supported = await isMessagingSupported();
  if (!supported) return null;

  try {
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn('[FCM] Failed to initialize Firebase Messaging:', err);
    return null;
  }
}

/**
 * Register the Service Worker for Firebase Messaging
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  if (serviceWorkerRegistration) return serviceWorkerRegistration;

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FCM] Service Worker registered successfully with scope:', registration.scope);
    serviceWorkerRegistration = registration;
    return registration;
  } catch (err) {
    console.warn('[FCM] Service Worker registration failed:', err);
    return null;
  }
}

/**
 * Request Notification Permission and generate/retrieve Firebase Cloud Messaging Device Token
 */
export async function requestAndSaveFCMToken(customUserId?: string, customUserEmail?: string): Promise<{
  success: boolean;
  token?: string;
  permission: NotificationPermission;
  error?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, permission: 'denied', error: 'เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน Web Notification' };
  }

  try {
    // 1. Request Permission from the user
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { 
        success: false, 
        permission, 
        error: permission === 'denied' 
          ? 'คุณได้ปิดกั้นการแจ้งเตือน กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราว์เซอร์' 
          : 'ยังไม่ได้รับการอนุญาตให้ส่งการแจ้งเตือน' 
      };
    }

    // 2. Register Service Worker
    const swReg = await registerServiceWorker();

    // 3. Initialize Firebase Messaging
    const messaging = await initFirebaseMessaging();
    if (!messaging) {
      // Fallback: Permission granted, but FCM SDK unsupported in this sandbox frame
      localStorage.setItem('studioref_notifications_enabled', 'true');
      return {
        success: true,
        permission: 'granted',
        token: 'local_notification_granted'
      };
    }

    // 4. Retrieve FCM Token
    let token: string | undefined;
    try {
      token = await getToken(messaging, {
        serviceWorkerRegistration: swReg || undefined
      });
    } catch (tokenErr: any) {
      console.warn('[FCM] getToken error (possibly missing VAPID key or iframe sandbox):', tokenErr);
    }

    const currentUid = customUserId || auth.currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 9);
    const currentEmail = customUserEmail || auth.currentUser?.email || '';

    // 5. Store Token in Firestore collection 'fcm_tokens'
    if (token) {
      localStorage.setItem('studioref_fcm_token', token);
      localStorage.setItem('studioref_notifications_enabled', 'true');

      try {
        const tokenId = token.substring(0, 32);
        await setDoc(doc(db, 'fcm_tokens', tokenId), {
          token,
          userId: currentUid,
          userEmail: currentEmail,
          userAgent: navigator.userAgent,
          platform: navigator.platform || 'web',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });

        // Update user document if logged in
        if (auth.currentUser) {
          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            fcmToken: token,
            notificationsEnabled: true,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (dbErr) {
        console.warn('[FCM] Could not write token to Firestore:', dbErr);
      }
    }

    return {
      success: true,
      token,
      permission: 'granted'
    };
  } catch (error: any) {
    console.error('[FCM] Error in requestAndSaveFCMToken:', error);
    return {
      success: false,
      permission: Notification.permission,
      error: error.message || 'ไม่สามารถรับโทเค็นการแจ้งเตือนได้'
    };
  }
}

/**
 * Setup Foreground Push Notification Listener
 */
export function setupForegroundMessageListener(onReceive: (notification: AppNotification) => void): () => void {
  let unsubscribeMessaging: (() => void) | null = null;

  initFirebaseMessaging().then((messaging) => {
    if (!messaging) return;

    try {
      unsubscribeMessaging = onMessage(messaging, (payload) => {
        console.log('[FCM] Foreground notification received:', payload);

        const newNotif: AppNotification = {
          title: payload.notification?.title || payload.data?.title || 'StudioRef Notification',
          body: payload.notification?.body || payload.data?.body || 'มีอัปเดตข้อมูลใหม่',
          icon: payload.notification?.icon || '/icon-192.png',
          type: (payload.data?.type as any) || 'system',
          targetUrl: payload.data?.url || '/',
          createdAt: new Date()
        };

        // If user is focused elsewhere or permitted, trigger native browser notification
        if (Notification.permission === 'granted' && document.hidden) {
          showNativeBrowserNotification(newNotif.title, {
            body: newNotif.body,
            icon: newNotif.icon,
            data: { url: newNotif.targetUrl }
          });
        }

        onReceive(newNotif);
      });
    } catch (err) {
      console.warn('[FCM] onMessage setup error:', err);
    }
  });

  return () => {
    if (unsubscribeMessaging) {
      unsubscribeMessaging();
    }
  };
}

/**
 * Trigger a native browser notification popup
 */
export function showNativeBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    // Try Service Worker registration first if available
    if (serviceWorkerRegistration && 'showNotification' in serviceWorkerRegistration) {
      serviceWorkerRegistration.showNotification(title, {
        icon: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80',
        badge: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=64&auto=format&fit=crop&q=80',
        ...options
      });
      return true;
    }

    // Fallback to standard window Notification
    const notif = new Notification(title, {
      icon: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=128&auto=format&fit=crop&q=80',
      ...options
    });

    notif.onclick = () => {
      window.focus();
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
      notif.close();
    };

    return true;
  } catch (err) {
    console.warn('[FCM] Native Notification trigger error:', err);
    return false;
  }
}

/**
 * Record a new notification to Firestore and send a browser push trigger
 */
export async function pushAppNotification(notification: {
  title: string;
  body: string;
  type?: 'design' | 'palette' | 'system' | 'welcome';
  targetUrl?: string;
  userId?: string;
}): Promise<void> {
  // 1. Show instant native browser notification
  showNativeBrowserNotification(notification.title, {
    body: notification.body,
    data: { url: notification.targetUrl || '/' }
  });

  // 2. Persist to Firestore notifications collection
  try {
    await addDoc(collection(db, 'notifications'), {
      title: notification.title,
      body: notification.body,
      type: notification.type || 'system',
      targetUrl: notification.targetUrl || '/',
      userId: notification.userId || auth.currentUser?.uid || 'all',
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn('[FCM] Could not persist notification to Firestore:', err);
  }
}

/**
 * Subscribe to realtime notifications from Firestore
 */
export function subscribeToNotifications(callback: (notifications: AppNotification[]) => void): () => void {
  try {
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || 'การแจ้งเตือน',
          body: data.body || '',
          icon: data.icon,
          type: data.type || 'system',
          targetUrl: data.targetUrl || '/',
          userId: data.userId,
          read: data.read ?? false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        });
      });
      callback(list);
    }, (error) => {
      console.warn('[FCM] Notification snapshot warning:', error);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[FCM] subscribeToNotifications failed:', err);
    return () => {};
  }
}
