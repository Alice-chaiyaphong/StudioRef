import React, { useState, useEffect } from 'react';
import { ReferenceDesign, ColorPalette } from './types.ts';
import { INITIAL_REFERENCES, CURATED_PALETTES } from './data/mockData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { PaletteStudioView } from './components/PaletteStudioView.tsx';
import { AIAssistantView } from './components/AIAssistantView.tsx';
import { SavedMoodboardView } from './components/SavedMoodboardView.tsx';
import { SharedItemsView } from './components/SharedItemsView.tsx';
import { ReferenceDetailModal } from './components/ReferenceDetailModal.tsx';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from './firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { AddContentModal } from './components/AddContentModal.tsx';
import { AdminView } from './components/AdminView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AlertTriangle, Copy, Check, X, Globe, ExternalLink, Sparkles, Plus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'palettes' | 'ai' | 'saved' | 'shared' | 'admin'>('explore');
  const [references, setReferences] = useState<ReferenceDesign[]>(INITIAL_REFERENCES);
  const [palettes, setPalettes] = useState<ColorPalette[]>(CURATED_PALETTES);
  const [selectedReference, setSelectedReference] = useState<ReferenceDesign | null>(null);
  const [aiConsultPrompt, setAiConsultPrompt] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [communityItems, setCommunityItems] = useState<any[]>([]);

  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  // Auth State Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Listen to browser URL path to support domain/admin
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path.endsWith('/admin')) {
        setActiveTab('admin');
      }
    };

    // Check on initial load
    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Update path dynamically when tab changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (activeTab === 'admin' && currentPath !== '/admin' && !currentPath.endsWith('/admin')) {
      window.history.pushState({}, '', '/admin');
    } else if (activeTab !== 'admin' && (currentPath === '/admin' || currentPath.endsWith('/admin'))) {
      window.history.pushState({}, '', '/');
    }
  }, [activeTab]);

  const loadLocalCommunityItems = () => {
    try {
      const localStr = localStorage.getItem('community_items_local');
      if (localStr) {
        return JSON.parse(localStr);
      }
    } catch (e) {
      console.warn('Error reading local community items:', e);
    }
    
    // Default initial community items to show if local is empty and server fails
    const defaultItems = [
      {
        id: 'default-comm-1',
        title: 'Nordic Clean Studio',
        subtitle: 'Minimal Web Portfolio Layout',
        type: 'design',
        description: 'การจัดเลย์เอาต์แนวพอร์ตโฟลิโอสไตล์นอร์ดิก คุมโทนสีขาวครีมและเขียวหม่น ดูสุขุมและโปร่งสบายตา',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        palette: ['#F9F7F2', '#EBE7E0', '#7C786F', '#3E4E4B', '#1E2E31'],
        tags: ['Web UI', 'Editorial', 'Minimal', 'Nordic'],
        typography: {
          heading: 'Playfair Display',
          body: 'Inter',
          vibe: 'พรีเมียม ร่วมสมัย สะอาดตา'
        },
        layoutNotes: [
          'ใช้ระยะห่างและ Margin กว้างกว่าปกติเพื่อความพรีเมียม',
          'เลือกคู่สีเบจครีมเป็นพื้นหลังตัดกับตัวอักษรสีเขียวหม่นและดำเข้ม'
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        userId: 'admin-1',
        userName: 'Woranech',
        userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        likes: 12
      },
      {
        id: 'default-comm-2',
        title: 'Ocean Frost Palette',
        type: 'palette',
        description: 'โทนสีเย็นที่ได้รับแรงบันดาลใจจากทะเลฤดูหนาวและเกล็ดน้ำแข็ง เหมาะกับงานดีไซน์ที่ต้องการความสุขุม เยือกเย็น และความโปร่งใส',
        colors: [
          { hex: '#EBF1F0', name: 'Ice Dust', role: 'Main Background' },
          { hex: '#B8CAC4', name: 'Sage Frost', role: 'Muted Accent' },
          { hex: '#7A938E', name: 'Ocean Mist', role: 'Secondary Accent' },
          { hex: '#3A6360', name: 'Deep Sage', role: 'Primary Brand' },
          { hex: '#1E2E31', name: 'Midnight Pine', role: 'Dominant Text' }
        ],
        tags: ['Cool Tone', 'Nature', 'Ocean', 'Frost'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        userId: 'admin-1',
        userName: 'Woranech',
        userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        likes: 8
      }
    ];
    try {
      localStorage.setItem('community_items_local', JSON.stringify(defaultItems));
    } catch (e) {
      console.warn('Error saving default community items:', e);
    }
    return defaultItems;
  };

  // Fetch Community designs & palettes in real-time
  useEffect(() => {
    // Initial load from local storage/defaults
    const initialItems = loadLocalCommunityItems();
    setCommunityItems(initialItems);

    const q = query(collection(db, "My Desing"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFirestoreError(null); // Reset any error state upon successful real-time connection!
      const liveItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Merge: prioritize live items, but preserve user-created local-only items!
      const currentLocal = loadLocalCommunityItems();
      const localOnly = currentLocal.filter((item: any) => String(item.id).startsWith('local_'));
      const merged = [...localOnly, ...liveItems];
      setCommunityItems(merged);
      
      // Update local storage backup with merged data
      try {
        localStorage.setItem('community_items_local', JSON.stringify(merged));
      } catch (e) {
        console.warn('Error updating local storage cache:', e);
      }
    }, (error) => {
      setFirestoreError(error instanceof Error ? error.message : String(error));
      try {
        handleFirestoreError(error, OperationType.LIST, "My Desing");
      } catch (err) {
        console.warn("Continuing with local storage fallback mode.");
      }
      
      // Fallback: reload current local items when permission is denied or offline
      const currentLocal = loadLocalCommunityItems();
      setCommunityItems(currentLocal);
    });

    // Listen for local updates from AddContentModal creation
    const handleLocalUpdate = () => {
      const currentLocal = loadLocalCommunityItems();
      setCommunityItems(currentLocal);
    };
    window.addEventListener('local_community_items_updated', handleLocalUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('local_community_items_updated', handleLocalUpdate);
    };
  }, []);

  const communityDesigns = communityItems.filter(item => item.type === 'design') as ReferenceDesign[];
  const communityPalettes = communityItems.filter(item => item.type === 'palette') as ColorPalette[];

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
      } else {
        setAuthError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Bookmark toggle handler
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReferences(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, bookmarked: !item.bookmarked };
      }
      return item;
    }));

    if (selectedReference && selectedReference.id === id) {
      setSelectedReference(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
    }
  };

  const handleOpenAIAssistant = (promptText?: string) => {
    if (promptText) {
      setAiConsultPrompt(promptText);
    }
    setActiveTab('ai');
  };

  const handleAddCustomPalette = (newPal: ColorPalette) => {
    setPalettes(prev => [newPal, ...prev]);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const [seeding, setSeeding] = useState(false);

  const handleSeedFirestore = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนนำเข้าข้อมูลตัวอย่าง');
      await handleGoogleSignIn();
      return;
    }
    setSeeding(true);
    try {
      const itemsToSeed = [
        {
          title: 'Nordic Clean Studio',
          subtitle: 'Minimal Web Portfolio Layout',
          type: 'design',
          description: 'การจัดเลย์เอาต์แนวพอร์ตโฟลิโอสไตล์นอร์ดิก คุมโทนสีขาวครีมและเขียวหม่น ดูสุขุมและโปร่งสบายตา',
          imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
          palette: ['#F9F7F2', '#EBE7E0', '#7C786F', '#3E4E4B', '#1E2E31'],
          tags: ['Web UI', 'Editorial', 'Minimal', 'Nordic'],
          typography: {
            heading: 'Playfair Display',
            body: 'Inter',
            vibe: 'พรีเมียม ร่วมสมัย สะอาดตา'
          },
          layoutNotes: [
            'ใช้ระยะห่างและ Margin กว้างกว่าปกติเพื่อความพรีเมียม',
            'เลือกคู่สีเบจครีมเป็นพื้นหลังตัดกับตัวอักษรสีเขียวหม่นและดำเข้ม'
          ],
          createdAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || 'Woranech',
          userPhoto: user.photoURL || '',
          likes: 12
        },
        {
          title: 'Ocean Frost Palette',
          type: 'palette',
          description: 'โทนสีเย็นที่ได้รับแรงบันดาลใจจากทะเลฤดูหนาวและเกล็ดน้ำแข็ง เหมาะกับงานดีไซน์ที่ต้องการความสุขุม เยือกเย็น และความโปร่งใส',
          colors: [
            { hex: '#EBF1F0', name: 'Ice Dust', role: 'Main Background' },
            { hex: '#B8CAC4', name: 'Sage Frost', role: 'Muted Accent' },
            { hex: '#7A938E', name: 'Ocean Mist', role: 'Secondary Accent' },
            { hex: '#3A6360', name: 'Deep Sage', role: 'Primary Brand' },
            { hex: '#1E2E31', name: 'Midnight Pine', role: 'Dominant Text' }
          ],
          tags: ['Cool Tone', 'Nature', 'Ocean', 'Frost'],
          createdAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || 'Woranech',
          userPhoto: user.photoURL || '',
          likes: 8
        },
        {
          title: 'Minimal Japanese Garden',
          subtitle: 'Wabi-Sabi Workspace Design',
          type: 'design',
          description: 'จัดระเบียบองค์ประกอบภาพแนวเซน คุมโทนสีธรรมชาติหินและใบไผ่แห้งเพื่อความเรียบง่าย นิ่งสงบ',
          imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          palette: ['#FDFCF9', '#D9D4CC', '#5A5A40', '#3E3C38', '#2D2D1B'],
          tags: ['Japanese', 'Interior', 'Calm', 'Wabi-Sabi'],
          typography: {
            heading: 'Noto Serif JP',
            body: 'Inter',
            vibe: 'เรียบง่าย นิ่งสงบ มีระดับ'
          },
          layoutNotes: [
            'เน้นความโปร่งและเส้นตารางแนวตั้ง',
            'ใช้ระยะเบลอฉากหลังเพื่อความนุ่มละมุนตา'
          ],
          createdAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || 'Woranech',
          userPhoto: user.photoURL || '',
          likes: 18
        },
        {
          title: 'Frozen Arctic Palette',
          type: 'palette',
          description: 'พาเลทคู่สีเยือกแข็งสไตล์ขั้วโลกเหนือ สำหรับงานพัฒนาซอฟต์แวร์หรือเทคโนโลยีที่ต้องการความคลีน ทันสมัย และเป็นมืออาชีพ',
          colors: [
            { hex: '#F0F4F8', name: 'Glacier Blue', role: 'Background 60%' },
            { hex: '#D9E2EC', name: 'Snowy Sky', role: 'Surface 25%' },
            { hex: '#BCCCDC', name: 'Arctic Mist', role: 'Border 8%' },
            { hex: '#486581', name: 'Cold Ocean', role: 'Primary Brand' },
            { hex: '#102A43', name: 'Midnight Deep', role: 'Text 2%' }
          ],
          tags: ['Arctic', 'Cool Tone', 'Corporate', 'Tech'],
          createdAt: serverTimestamp(),
          userId: user.uid,
          userEmail: user.email || '',
          userName: user.displayName || 'Woranech',
          userPhoto: user.photoURL || '',
          likes: 15
        }
      ];

      for (const item of itemsToSeed) {
        await addDoc(collection(db, "My Desing"), item);
      }
      alert('นำเข้าข้อมูลเริ่มต้นสำเร็จแล้ว! ข้อมูลได้เชื่อมโยงและนำขึ้นระบบ Cloud Firestore เรียบร้อยแล้ว');
    } catch (err: any) {
      console.error('Error seeding data:', err);
      alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  const savedCount = references.filter(r => r.bookmarked).length;

  const mySharedDesigns = user 
    ? communityDesigns.filter(item => item.userId === user.uid) 
    : [];
  const mySharedPalettes = user 
    ? communityPalettes.filter(item => item.userId === user.uid) 
    : [];
  const sharedCount = mySharedDesigns.length + mySharedPalettes.length;

  if (activeTab === 'admin') {
    return (
      <AdminView 
        user={user}
        communityItems={communityItems}
        onRefreshData={() => {
          // Trigger real-time synchronization on the client
          window.dispatchEvent(new Event('local_community_items_updated'));
        }}
        onGoBack={() => setActiveTab('explore')}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-[#324c54] text-[#2C3E42] flex flex-col md:flex-row overflow-hidden font-sans select-none" style={{ backgroundColor: '#324c54' }}>
      {/* Fixed Left Navigation Rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        savedCount={savedCount}
        sharedCount={sharedCount}
        user={user}
        onSignIn={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        {activeTab === 'explore' && (
          <ExploreView 
            references={references}
            communityDesigns={communityDesigns}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onToggleBookmark={handleToggleBookmark}
            onOpenAIAssistant={handleOpenAIAssistant}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'palettes' && (
          <PaletteStudioView 
            palettes={palettes}
            communityPalettes={communityPalettes}
            onAddPalette={handleAddCustomPalette}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantView 
            initialPrompt={aiConsultPrompt}
          />
        )}

        {activeTab === 'saved' && (
          <SavedMoodboardView 
            savedReferences={references.filter(r => r.bookmarked)}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onToggleBookmark={handleToggleBookmark}
            onExploreMore={() => setActiveTab('explore')}
          />
        )}

        {activeTab === 'shared' && (
          <SharedItemsView 
            sharedDesigns={mySharedDesigns}
            sharedPalettes={mySharedPalettes}
            allDesigns={communityDesigns}
            allPalettes={communityPalettes}
            user={user}
            onSignIn={() => setIsAuthModalOpen(true)}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onToggleBookmark={handleToggleBookmark}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSeedFirestore={handleSeedFirestore}
            seeding={seeding}
            firestoreError={firestoreError}
            onEditItem={handleEditItem}
          />
        )}

        {/* Floating Action Buttons (FABs) in the Bottom Right Corner */}
        <div className="fixed md:absolute bottom-20 md:bottom-6 right-6 z-40 flex flex-col gap-3">
          {activeTab !== 'ai' && (
            <>
              <button 
                onClick={() => handleOpenAIAssistant("แนะนำเรฟดีไซน์และโทนสีมินิมอลโมเดิร์นโทนเย็นสำหรับปรึกษางานใหม่ให้หน่อย")}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#3A6360] text-white flex items-center justify-center hover:bg-[#2C4B49] hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl cursor-pointer group relative"
                title="ปรึกษา AI"
                id="fab-consult-ai"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <span className="absolute right-14 sm:right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-[#1E2E31] text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                  ปรึกษา AI ✨
                </span>
              </button>

              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1E2E31] text-white flex items-center justify-center hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl cursor-pointer group relative"
                title="แชร์ผลงานใหม่"
                id="fab-share-design"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#B8CAC4]" />
                <span className="absolute right-14 sm:right-16 scale-0 group-hover:scale-100 transition-all origin-right bg-[#1E2E31] text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
                  แชร์ผลงานใหม่ ✦
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reference Modal Specs Detail */}
      <ReferenceDetailModal 
        design={selectedReference}
        onClose={() => setSelectedReference(null)}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* Firebase Domain Authorization Error Modal */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setAuthError(null)}>
          <div 
            className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 border border-[#D1DDD9] shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setAuthError(null)}
              className="absolute top-5 right-5 p-2 bg-[#DDE5E4] hover:bg-[#D1DDD9] text-[#1E2E31] rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="text-lg font-serif italic font-bold text-[#1E2E31]">ต้องเพิ่ม Authorized Domain </h3>
                <p className="text-xs text-[#5C7276]">Firebase ปิดกั้นการล็อกอินเนื่องจากยังไม่ได้อนุญาตโดเมนนี้</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#2C3E42] leading-relaxed">
              <p>
                กรุณานำโดเมนเหล่านี้ไปเพิ่มลงใน <strong>Firebase Console</strong> ของคุณ เพื่อให้สามารถใช้ปุ่มล็อกอิน Google ได้สำเร็จ:
              </p>
              
              <div className="bg-[#EBF1F0] p-4 rounded-xl border border-[#D1DDD9] space-y-3">
                <p className="font-bold text-[#1E2E31] text-[11px] uppercase tracking-wider">โดเมนที่ต้องกรอก (คลิกขวาเพื่อคัดลอก):</p>
                
                {[
                  'localhost',
                  'ais-dev-txpgdtsdxzqt5akwnhhuyr-1066069675596.asia-southeast1.run.app',
                  'ais-pre-txpgdtsdxzqt5akwnhhuyr-1066069675596.asia-southeast1.run.app'
                ].map((dom) => (
                  <div key={dom} className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-[#D1DDD9] font-mono text-[11px] text-[#1E2E31]">
                    <span className="truncate select-all">{dom}</span>
                    <button
                      onClick={() => copyToClipboard(dom)}
                      className="p-1.5 bg-[#EBF1F0] hover:bg-[#DDE5E4] rounded-md text-[#3A6360] hover:text-[#1E2E31] transition-all cursor-pointer shrink-0"
                      title="คัดลอกโดเมน"
                    >
                      {copiedDomain === dom ? (
                        <Check className="w-3.5 h-3.5 text-green-600 animate-in zoom-in" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="font-bold text-[#1E2E31]">วิธีเพิ่มใน Firebase Console 🚀</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#5C7276]">
                  <li>เข้าสู่เว็บไซต์ <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#3A6360] font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>เลือกเมนู <strong>Authentication</strong></li>
                  <li>คลิกแท็บ <strong>Settings</strong> ด้านบน</li>
                  <li>เลือกเมนูย่อย <strong>Authorized domains</strong></li>
                  <li>กดปุ่ม <strong>Add domain</strong> วางโดเมนข้างต้นทีละรายการ แล้วกดเซฟ</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setAuthError(null)}
              className="mt-6 w-full py-2.5 bg-[#3A6360] hover:bg-[#2E4F4C] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              รับทราบ / ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      )}
      {/* Add Content Form Modal */}
      <AddContentModal 
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        user={user}
        onPromptSignIn={() => setIsAuthModalOpen(true)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      {/* Custom Auth & Registration Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
