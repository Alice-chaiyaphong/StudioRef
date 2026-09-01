import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  BellOff, 
  Check, 
  AlertTriangle, 
  Send, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Radio, 
  Clock, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { 
  requestAndSaveFCMToken, 
  getNotificationPermission, 
  showNativeBrowserNotification, 
  pushAppNotification,
  subscribeToNotifications, 
  AppNotification,
  isMessagingSupported
} from '../services/notificationService.ts';
import { User } from 'firebase/auth';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [testTitle, setTestTitle] = useState('StudioRef: ดีไซน์ใหม่มาแล้ว! ✨');
  const [testBody, setTestBody] = useState('พาเลทสีโทนเย็นและเรฟเฟอร์เรนซ์โมเดิร์นถูกเพิ่มลงในระบบ');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showTokenDetails, setShowTokenDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check current browser notification permission and storage
      setPermission(getNotificationPermission());
      const savedToken = localStorage.getItem('studioref_fcm_token');
      if (savedToken) setFcmToken(savedToken);

      isMessagingSupported().then(setIsSupported);

      // Subscribe to notifications list
      const unsubscribe = subscribeToNotifications((list) => {
        setNotifications(list);
      });

      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnableNotifications = async () => {
    setLoading(true);
    setStatusMessage(null);

    const result = await requestAndSaveFCMToken(user?.uid, user?.email || undefined);
    setPermission(result.permission);
    if (result.token) {
      setFcmToken(result.token);
    }

    if (result.success) {
      setStatusMessage({
        text: 'เปิดการแจ้งเตือน Web Browser ผ่าน Firebase Messaging สำเร็จ! 🔔',
        type: 'success'
      });

      // Send an instant welcome push notification
      showNativeBrowserNotification('ยินดีต้อนรับสู่ StudioRef Web Notifications ✨', {
        body: 'คุณได้เปิดรับการแจ้งเตือนจากระบบเรียบร้อยแล้ว'
      });
    } else {
      setStatusMessage({
        text: result.error || 'ไม่สามารถเปิดการแจ้งเตือนได้',
        type: 'error'
      });
    }
    setLoading(false);
  };

  const handleSendTestNotification = async () => {
    if (permission !== 'granted') {
      setStatusMessage({
        text: 'กรุณากดเปิดการแจ้งเตือน Web Browser ด้านบนก่อนส่งการแจ้งเตือน',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    await pushAppNotification({
      title: testTitle || 'StudioRef Alert',
      body: testBody || 'ทดสอบการส่งการแจ้งเตือน Web Browser สำเร็จ',
      type: 'system',
      userId: user?.uid
    });

    setStatusMessage({
      text: 'ส่งการแจ้งเตือนไปยัง Web Browser เรียบร้อยแล้ว! 🚀',
      type: 'success'
    });
    setLoading(false);
  };

  const handleCopyToken = () => {
    if (!fcmToken) return;
    navigator.clipboard.writeText(fcmToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-[#1C3033] w-full max-w-xl rounded-3xl border border-[#3A6360]/40 shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#3A6360]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3A6360]/30 border border-[#3A6360]/50 flex items-center justify-center text-[#9AD6CD]">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif italic text-white">Firebase Web Messaging</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#3A6360] text-emerald-200 font-bold uppercase tracking-wider">
                  FCM Service
                </span>
              </div>
              <p className="text-xs text-[#7A938E]">
                ระบบแจ้งเตือนผ่าน Web Browser และ Firebase Cloud Messaging
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 bg-[#101F21] hover:bg-[#253D41] text-[#7A938E] hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status Message Banner */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300' 
                : 'bg-rose-950/50 border-rose-800/50 text-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{statusMessage.text}</p>
              </div>
            </div>
          )}

          {/* Permission & FCM Activation Card */}
          <div className="p-5 rounded-2xl bg-[#101F21] border border-[#3A6360]/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className={`w-4 h-4 ${permission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#B8CAC4]">สถานะการแจ้งเตือน Web Browser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  permission === 'granted' 
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' 
                    : permission === 'denied'
                    ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                    : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                }`}>
                  {permission === 'granted' ? '✓ อนุญาตแล้ว (Granted)' : permission === 'denied' ? '✕ ปิดกั้น (Blocked)' : '○ ยังไม่ได้เปิด (Default)'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#7A938E] leading-relaxed">
              เมื่อเปิดใช้งาน เบราว์เซอร์จะรับสัญญาณแจ้งเตือน Realtime Push จาก Firebase Cloud Messaging เมื่อมีเรฟเฟอร์เรนซ์และพาเลทสีใหม่ แม้ขณะไม่ได้เปิดหน้าจอ
            </p>

            <div className="pt-1">
              {permission !== 'granted' ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleEnableNotifications}
                  className="w-full py-3 px-4 bg-[#3A6360] hover:bg-[#4E8480] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>{loading ? 'กำลังเชื่อมต่อ Firebase Messaging...' : 'เปิดการแจ้งเตือน Web Browser (FCM)'}</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 py-2.5 px-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>พร้อมรับการแจ้งเตือน Realtime จาก Firebase</span>
                  </div>
                  <button
                    onClick={handleEnableNotifications}
                    className="py-2.5 px-3 bg-[#1C3033] hover:bg-[#253D41] text-[#7A938E] hover:text-white rounded-xl text-xs font-medium border border-[#3A6360]/30 transition-all cursor-pointer"
                    title="รีเฟรชโทเค็น"
                  >
                    รีเฟรช
                  </button>
                </div>
              )}
            </div>

            {/* FCM Token Display Accordion */}
            {fcmToken && (
              <div className="pt-2 border-t border-[#3A6360]/20">
                <button 
                  type="button"
                  onClick={() => setShowTokenDetails(!showTokenDetails)}
                  className="text-[11px] text-[#9AD6CD] hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>{showTokenDetails ? 'ซ่อน FCM Device Token' : 'ดู FCM Device Token สำหรับส่งแจ้งเตือน'}</span>
                </button>

                {showTokenDetails && (
                  <div className="mt-3 p-3 bg-[#0C1719] rounded-xl border border-[#3A6360]/30 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#7A938E]">
                      <span>FCM Registration Token:</span>
                      <button
                        onClick={handleCopyToken}
                        className="flex items-center gap-1 text-[#9AD6CD] hover:text-white cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกโทเค็น'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-white/80 break-all bg-black/40 p-2 rounded-lg border border-white/5 select-all">
                      {fcmToken}
                    </p>
                    <p className="text-[9px] text-[#5C7276]">
                      โทเค็นนี้ถูกจัดเก็บลงใน Firestore collection <code className="text-[#9AD6CD]">fcm_tokens</code> เรียบร้อยแล้ว
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Notification Simulator */}
          <div className="p-5 rounded-2xl bg-[#101F21] border border-[#3A6360]/30 space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#9AD6CD]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8CAC4]">
                ทดสอบส่งการแจ้งเตือนไปยัง Web Browser
              </h4>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] text-[#7A938E] font-medium mb-1">หัวข้อการแจ้งเตือน</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="เช่น StudioRef: อัปเดตใหม่"
                  className="w-full bg-[#1C3033] border border-[#3A6360]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B8CAC4]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#7A938E] font-medium mb-1">ข้อความรายละเอียด</label>
                <input
                  type="text"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  placeholder="เช่น มีพาเลทสีและเรฟเฟอร์เรนซ์ใหม่"
                  className="w-full bg-[#1C3033] border border-[#3A6360]/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#B8CAC4]"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleSendTestNotification}
              className="w-full py-2.5 px-4 bg-[#253D41] hover:bg-[#3A6360] text-white rounded-xl text-xs font-bold transition-all border border-[#3A6360]/40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งแจ้งเตือนทดสอบ (Browser Test Alert)</span>
            </button>
          </div>

          {/* Recent Notification Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A938E]">
                ประวัติการแจ้งเตือนล่าสุด ({notifications.length})
              </h4>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center bg-[#101F21]/60 rounded-2xl border border-dashed border-[#3A6360]/20 text-[#5C7276] text-xs">
                ยังไม่มีประวัติการแจ้งเตือน
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {notifications.map((notif, idx) => (
                  <div key={notif.id || idx} className="p-3.5 bg-[#101F21] rounded-xl border border-[#3A6360]/20 flex items-start gap-3 hover:border-[#3A6360]/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#3A6360]/30 flex items-center justify-center shrink-0 text-[#9AD6CD] mt-0.5">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-white truncate">{notif.title}</h5>
                        <span className="text-[9px] text-[#5C7276] shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {notif.createdAt instanceof Date ? notif.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'เพิ่งเกิดขึ้น'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A938E] mt-0.5 line-clamp-2">{notif.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#101F21] border-t border-[#3A6360]/20 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C3033] hover:bg-[#253D41] text-xs text-[#B8CAC4] font-medium rounded-xl border border-[#3A6360]/30 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
