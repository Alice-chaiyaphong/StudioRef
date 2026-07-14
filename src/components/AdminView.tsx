import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy 
} from 'firebase/firestore';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  DollarSign, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Settings, 
  LogOut, 
  RefreshCw, 
  Palette, 
  Eye, 
  X, 
  Image as ImageIcon, 
  Tag, 
  Sparkles,
  Layout,
  Database,
  Grid,
  Filter,
  Check,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

interface AdminViewProps {
  user: any;
  communityItems: any[];
  onRefreshData?: () => void;
  onGoBack?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  communityItems: initialCommunityItems,
  onRefreshData,
  onGoBack
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin_logged_in') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Database Items state
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Custom Delete Confirmation & Notification States
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<any | null>(null);
  const [deletingProgress, setDeletingProgress] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dismiss notification automatically
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Form Fields
  const [formType, setFormType] = useState<'design' | 'palette'>('design');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState('Modern Minimal');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formPriceCondition, setFormPriceCondition] = useState<'free' | 'premium' | 'paid'>('free');

  // Design Fields
  const [designPalette, setDesignPalette] = useState<string[]>(['#EBF1F0', '#B8CAC4', '#7A938E', '#3A6360', '#1E2E31']);
  const [typographyHeading, setTypographyHeading] = useState('Space Grotesk');
  const [typographyBody, setTypographyBody] = useState('Inter');
  const [typographyVibe, setTypographyVibe] = useState('เรียบง่าย โมเดิร์น คูลโทน');
  const [layoutNotesInput, setLayoutNotesInput] = useState('ใช้ระยะห่างและ Margin กว้างกว่าปกติเพื่อความพรีเมียม\nคุมโทนสีขาวครีมและเขียวหม่น ดูสุขุมสะดุดตา');

  // Palette Fields
  const [paletteColors, setPaletteColors] = useState<Array<{ hex: string; name: string; role: string }>>([
    { hex: '#EBF1F0', name: 'Ice Dust', role: 'Main Background' },
    { hex: '#B8CAC4', name: 'Sage Frost', role: 'Muted Accent' },
    { hex: '#7A938E', name: 'Ocean Mist', role: 'Secondary Accent' },
    { hex: '#3A6360', name: 'Deep Sage', role: 'Primary Brand' },
    { hex: '#1E2E31', name: 'Midnight Pine', role: 'Dominant Text' }
  ]);

  // Image Upload helper
  const [uploadProgress, setUploadProgress] = useState(false);

  // Load items from Firestore & Local Storage Backup
  const loadItems = async () => {
    setLoading(true);
    try {
      // 1. Try Firestore First
      const q = query(collection(db, "My Desing"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const firestoreItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Load Local Storage items too
      const localStr = localStorage.getItem('community_items_local');
      const localItems = localStr ? JSON.parse(localStr) : [];
      const localOnly = localItems.filter((item: any) => String(item.id).startsWith('local_'));

      // Merge items, putting localOnly items first or aligning
      const merged = [...localOnly, ...firestoreItems];
      setItems(merged);
    } catch (error) {
      console.warn("Firestore fetch error in Admin view. Falling back to local storage.", error);
      // Fallback
      const localStr = localStorage.getItem('community_items_local');
      if (localStr) {
        setItems(JSON.parse(localStr));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('is_admin_logged_in', 'true');
      setLoginError(null);
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง! (ใช้ admin / admin)');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('is_admin_logged_in');
  };

  // Image upload and downscale to fit Firestore
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(true);
    try {
      const base64 = await compressAndResizeImage(file);
      setFormImageUrl(base64);
    } catch (err) {
      console.error("Failed to read image", err);
      alert("ไม่สามารถอ่านไฟล์ภาพได้");
    } finally {
      setUploadProgress(false);
    }
  };

  const compressAndResizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500; // Optimal size
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressed);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Open Form for Create
  const openCreateForm = (type: 'design' | 'palette') => {
    setEditingItem(null);
    setFormType(type);
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('Modern Minimal');
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80');
    setFormTags('');
    setFormPrice(0);
    setFormPriceCondition('free');
    
    // Set default design specific fields
    setDesignPalette(['#F9F7F2', '#EBE7E0', '#7C786F', '#3E4E4B', '#1E2E31']);
    setTypographyHeading('Space Grotesk');
    setTypographyBody('Inter');
    setTypographyVibe('เรียบง่าย โมเดิร์น ร่วมสมัย');
    setLayoutNotesInput('เว้นช่องว่างอย่างเหมาะสมเพื่อความสวยงาม\nใช้สีสว่างเป็นพื้นหลังตัดกับสีเข้ม');

    // Set default palette colors
    setPaletteColors([
      { hex: '#EBF1F0', name: 'Ice Dust', role: 'Main Background' },
      { hex: '#B8CAC4', name: 'Sage Frost', role: 'Muted Accent' },
      { hex: '#7A938E', name: 'Ocean Mist', role: 'Secondary Accent' },
      { hex: '#3A6360', name: 'Deep Sage', role: 'Primary Brand' },
      { hex: '#1E2E31', name: 'Midnight Pine', role: 'Dominant Text' }
    ]);

    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const openEditForm = (item: any) => {
    setEditingItem(item);
    setFormType(item.type || 'design');
    setFormTitle(item.title || '');
    setFormSubtitle(item.subtitle || '');
    setFormCategory(item.category || 'Modern Minimal');
    setFormDescription(item.description || '');
    setFormImageUrl(item.imageUrl || '');
    setFormTags(item.tags ? item.tags.join(', ') : '');
    setFormPrice(item.price || 0);
    setFormPriceCondition(item.priceCondition || 'free');

    if (item.type === 'design') {
      setDesignPalette(item.palette || ['#F9F7F2', '#EBE7E0', '#7C786F', '#3E4E4B', '#1E2E31']);
      setTypographyHeading(item.typography?.heading || 'Space Grotesk');
      setTypographyBody(item.typography?.body || 'Inter');
      setTypographyVibe(item.typography?.vibe || 'เรียบง่าย โมเดิร์น');
      setLayoutNotesInput(item.layoutNotes ? item.layoutNotes.join('\n') : '');
    } else {
      setPaletteColors(item.colors || [
        { hex: '#EBF1F0', name: 'Ice Dust', role: 'Main Background' },
        { hex: '#B8CAC4', name: 'Sage Frost', role: 'Muted Accent' },
        { hex: '#7A938E', name: 'Ocean Mist', role: 'Secondary Accent' },
        { hex: '#3A6360', name: 'Deep Sage', role: 'Primary Brand' },
        { hex: '#1E2E31', name: 'Midnight Pine', role: 'Dominant Text' }
      ]);
    }

    setFormError(null);
    setIsFormOpen(true);
  };

  // Delete Action
  const handleDeleteItem = async (itemId: string) => {
    setDeletingProgress(true);
    try {
      const isLocal = String(itemId).startsWith('local_');
      if (isLocal) {
        // Remove from local storage
        const localStr = localStorage.getItem('community_items_local');
        if (localStr) {
          const localItems = JSON.parse(localStr);
          const updated = localItems.filter((i: any) => i.id !== itemId);
          localStorage.setItem('community_items_local', JSON.stringify(updated));
        }
      } else {
        // Remove from Firestore
        await deleteDoc(doc(db, "My Desing", itemId));
      }

      // Success
      setItems(prev => prev.filter(i => i.id !== itemId));
      if (onRefreshData) onRefreshData();
      setNotification({ message: 'ลบข้อมูลสำเร็จเรียบร้อยแล้ว! ✨', type: 'success' });
      setDeleteConfirmItem(null);
    } catch (err: any) {
      console.error("Error deleting item", err);
      handleFirestoreError(err, OperationType.DELETE, "My Desing");
      setNotification({ message: 'ล้มเหลวในการลบข้อมูล: ' + err.message, type: 'error' });
    } finally {
      setDeletingProgress(false);
    }
  };

  // Submit Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('กรุณากรอกหัวข้อบทความ / ชื่องานดีไซน์');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const parsedTags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const docData: any = {
      title: formTitle,
      category: formCategory,
      description: formDescription,
      type: formType,
      tags: parsedTags.length > 0 ? parsedTags : [formType === 'design' ? 'Design' : 'Palette', formCategory],
      price: Number(formPrice) || 0,
      priceCondition: formPriceCondition,
      userId: editingItem ? (editingItem.userId || 'admin-1') : 'admin-1',
      userEmail: editingItem ? (editingItem.userEmail || 'admin@studio.ref') : 'admin@studio.ref',
      userName: editingItem ? (editingItem.userName || 'Woranech (Admin)') : 'Woranech (Admin)',
      userPhoto: editingItem ? (editingItem.userPhoto || '') : '',
    };

    if (!editingItem) {
      docData.likes = 0;
      docData.createdAt = serverTimestamp();
    } else {
      docData.updatedAt = serverTimestamp();
    }

    if (formType === 'design') {
      docData.subtitle = formSubtitle || formCategory;
      docData.imageUrl = formImageUrl || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
      docData.palette = designPalette;
      docData.typography = {
        heading: typographyHeading,
        body: typographyBody,
        vibe: typographyVibe
      };
      docData.layoutNotes = layoutNotesInput
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
    } else {
      docData.colors = paletteColors.map(c => ({
        hex: c.hex,
        name: c.name || 'Custom Color',
        role: c.role || 'Secondary Decor'
      }));
    }

    try {
      if (editingItem) {
        // Edit Item
        const isLocal = String(editingItem.id).startsWith('local_');
        if (isLocal) {
          const localStr = localStorage.getItem('community_items_local');
          const localItems = localStr ? JSON.parse(localStr) : [];
          const updated = localItems.map((item: any) => 
            item.id === editingItem.id ? { 
              ...item, 
              ...docData, 
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            } : item
          );
          localStorage.setItem('community_items_local', JSON.stringify(updated));
        } else {
          // Update in Firestore
          await updateDoc(doc(db, "My Desing", editingItem.id), docData);
        }
      } else {
        // Create New Item
        try {
          // Try Firestore
          await addDoc(collection(db, "My Desing"), docData);
        } catch (dbErr) {
          console.warn("Could not save to Cloud Firestore, saving locally instead", dbErr);
          // Save locally if Firestore auth or connection is not working
          const localStr = localStorage.getItem('community_items_local');
          const localItems = localStr ? JSON.parse(localStr) : [];
          const newItem = {
            id: 'local_' + Date.now(),
            ...docData,
            createdAt: new Date().toISOString()
          };
          localItems.unshift(newItem);
          localStorage.setItem('community_items_local', JSON.stringify(localItems));
        }
      }

      // Refresh data
      window.dispatchEvent(new Event('local_community_items_updated'));
      if (onRefreshData) onRefreshData();
      await loadItems();
      setIsFormOpen(false);
      alert(editingItem ? "อัปเดตบทความเรียบร้อยแล้ว!" : "เพิ่มบทความใหม่เข้าสู่ระบบหลังบ้านเรียบร้อยแล้ว!");
    } catch (err: any) {
      console.error("Failed to submit form", err);
      setFormError("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to change color hex in design palette
  const updateDesignPaletteColor = (index: number, newHex: string) => {
    const updated = [...designPalette];
    updated[index] = newHex;
    setDesignPalette(updated);
  };

  // Helper to change paletteColors
  const updatePaletteColorField = (index: number, key: 'hex' | 'name' | 'role', value: string) => {
    const updated = [...paletteColors];
    updated[index] = { ...updated[index], [key]: value };
    setPaletteColors(updated);
  };

  // Search filter matching
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = Array.from(new Set(items.map(i => i.category).filter(Boolean)));

  // If NOT authenticated, show a gorgeous 16:9 widescreen layout login panel
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#142325] text-white flex items-center justify-center font-sans p-4 sm:p-6 overflow-y-auto">
        {/* Widescreen 16:9 Frame */}
        <div className="w-full max-w-5xl md:aspect-video bg-[#1C3033] rounded-[24px] sm:rounded-[32px] border border-[#3A6360]/40 shadow-2xl flex flex-col md:flex-row overflow-hidden relative min-h-[550px] md:min-h-0">
          
          {/* Decorative Back Vibe */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#3A6360] opacity-20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[-15%] right-[-10%] w-[40%] aspect-square rounded-full bg-[#B8CAC4] opacity-10 blur-3xl pointer-events-none"></div>

          {/* Left Hero Brand Block */}
          <div className="w-full md:w-1/2 bg-[#101F21] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#3A6360]/20 z-10 relative">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-[#B8CAC4] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#7A938E] font-bold">RefStudio Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif italic text-white leading-tight font-medium">
                Admin <br />
                <span className="text-[#B8CAC4] not-italic font-sans font-semibold text-2xl sm:text-3xl">Back-office Portal</span>
              </h1>
              <p className="text-xs text-[#7A938E] mt-4 leading-relaxed max-w-xs">
                ระบบจัดการฐานข้อมูลบทความ รูปภาพเรฟ สีพาเลท และวิเคราะห์ข้อมูลราคาแบบครบวงจร
              </p>
            </div>

            <div className="space-y-4 mt-8 md:mt-0">
              <div className="flex items-center gap-2 text-xs text-[#B8CAC4]">
                <Unlock className="w-4 h-4 text-[#B8CAC4] shrink-0" />
                <span>เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบ (admin / admin)</span>
              </div>
              <button 
                onClick={onGoBack}
                className="text-xs text-[#7A938E] hover:text-[#B8CAC4] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> กลับหน้าบอร์ดแสดงผลผู้ใช้ทั่วไป
              </button>
            </div>
          </div>

          {/* Right Login Form Block */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center z-10">
            <h2 className="text-xl font-bold text-white mb-1.5">เข้าสู่ระบบหลังบ้าน</h2>
            <p className="text-xs text-[#7A938E] mb-6">กรุณาระบุข้อมูลผู้ดูแลระบบเพื่อเข้าสู่โหมดปรับแต่งหน้าเว็บ</p>

            {loginError && (
              <div className="mb-4 bg-rose-950/40 text-rose-300 border border-rose-800/40 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#101F21] border border-[#3A6360]/40 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8CAC4] transition-colors"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#3A6360] hover:bg-[#4E8480] text-[#142325] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer mt-2 text-white"
              >
                ยืนยันตัวตนเข้าระบบ ⚡
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#142325] text-white flex items-center justify-center font-sans p-3 sm:p-6 overflow-y-auto">
      {/* Responsive Content Container */}
      <div className="w-full max-w-[1300px] h-[94vh] lg:h-auto lg:aspect-[16/9] bg-[#1C3033] rounded-[24px] lg:rounded-[36px] border border-[#3A6360]/40 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header Bar */}
        <header className="px-5 lg:px-8 py-4 lg:py-5 border-b border-[#3A6360]/20 flex items-center justify-between bg-[#101F21]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3A6360] flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-serif italic text-white">RefStudio Back-office</h1>
                <span className="text-[8px] sm:text-[9px] bg-[#B8CAC4]/20 text-[#B8CAC4] px-2 py-0.5 rounded-full font-mono font-bold uppercase">Admin Mode</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#7A938E] hidden sm:block">สิทธิ์ผู้ดูแลระบบสูงสุด • ควบคุม CRUD ฐานข้อมูลแบบเรียลไทม์</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onGoBack}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1C3033] hover:bg-[#253D41] border border-[#3A6360]/30 rounded-xl text-[10px] sm:text-xs text-[#B8CAC4] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">พรีวิวหน้าเว็บ</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#B86B52]/10 hover:bg-[#B86B52]/25 text-[#FF8E75] rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </header>

        {/* Dashboard Responsive Grid Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Sidebar controls & Statistics (rearranged horizontally on tablet/mobile) */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#3A6360]/20 p-4 lg:p-5 bg-[#101F21]/30 flex flex-col sm:flex-row lg:flex-col justify-between shrink-0 gap-4 lg:gap-0">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-5 w-full">
              
              {/* Seeding & Quick CRUD Options */}
              <div className="space-y-2 flex-1 sm:max-w-xs lg:max-w-none">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A938E] block">สร้างบทความใหม่</span>
                <div className="flex flex-row lg:flex-col gap-2">
                  <button
                    onClick={() => openCreateForm('design')}
                    className="flex-1 py-2 sm:py-2.5 bg-[#3A6360] hover:bg-[#4E8480] text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> <span>+ เรฟดีไซน์</span>
                  </button>
                  <button
                    onClick={() => openCreateForm('palette')}
                    className="flex-1 py-2 sm:py-2.5 bg-[#1C3033] hover:bg-[#253D41] border border-[#3A6360]/40 text-[#B8CAC4] text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#B8CAC4]" /> <span>+ พาเลทสี</span>
                  </button>
                </div>
              </div>

              {/* Data Statistics Panel */}
              <div className="bg-[#101F21]/60 p-3 lg:p-4 rounded-2xl border border-[#3A6360]/20 space-y-2 flex-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A938E] block">ข้อมูลสถิติ</span>
                
                <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 sm:gap-2">
                  <div className="bg-[#1C3033] p-1.5 rounded-lg text-center">
                    <span className="text-[8px] sm:text-[9px] text-[#7A938E] block">ทั้งหมด</span>
                    <span className="text-sm lg:text-lg font-bold text-[#B8CAC4]">{items.length}</span>
                  </div>
                  <div className="bg-[#1C3033] p-1.5 rounded-lg text-center">
                    <span className="text-[8px] sm:text-[9px] text-[#7A938E] block">ดีไซน์</span>
                    <span className="text-sm lg:text-lg font-bold text-[#B8CAC4]">
                      {items.filter(i => i.type === 'design').length}
                    </span>
                  </div>
                  <div className="bg-[#1C3033] p-1.5 rounded-lg text-center">
                    <span className="text-[8px] sm:text-[9px] text-[#7A938E] block">พาเลท</span>
                    <span className="text-sm lg:text-lg font-bold text-[#B8CAC4]">
                      {items.filter(i => i.type === 'palette').length}
                    </span>
                  </div>
                  <div className="bg-[#1C3033] p-1.5 rounded-lg text-center">
                    <span className="text-[8px] sm:text-[9px] text-[#7A938E] block">ติดราคา</span>
                    <span className="text-sm lg:text-lg font-bold text-[#B86B52]">
                      {items.filter(i => i.priceCondition && i.priceCondition !== 'free').length}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Helper Tips (Hidden on smaller viewports to optimize space) */}
            <div className="hidden lg:block bg-[#3A6360]/5 p-3 rounded-xl border border-[#3A6360]/10 text-[10px] text-[#7A938E] leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-[#B8CAC4] mb-1 inline" /> <strong>ระบบอัปโหลดอัจฉริยะ</strong> จะทำการย่อรูปภาพของคุณให้อยู่ในขนาดกะทัดรัด (ความกว้าง 500px) โดยอัตโนมัติ เพื่อรักษาขีดจำกัดหน่วยความจำ Firestore ของฟรี
            </div>
          </div>

          {/* Main Table area */}
          <div className="flex-1 p-4 lg:p-6 flex flex-col overflow-hidden bg-[#162729]">
            
            {/* Search & Filtering Panel */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 shrink-0">
              <div className="w-full sm:w-80 relative">
                <Search className="w-4 h-4 text-[#7A938E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="ค้นหาชื่องาน, หมวดหมู่, แฮชแท็ก..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#5C7276] focus:outline-none focus:border-[#3A6360]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1 text-xs text-[#7A938E] shrink-0">
                  <Filter className="w-3 h-3" /> ตัวกรอง:
                </div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3 py-2 text-xs text-[#B8CAC4] focus:outline-none"
                >
                  <option value="all">ทุกประเภทไอเท็ม</option>
                  <option value="design">เฉพาะเรฟดีไซน์</option>
                  <option value="palette">เฉพาะพาเลทสี</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3 py-2 text-xs text-[#B8CAC4] focus:outline-none"
                >
                  <option value="all">ทุกหมวดหมู่ดีไซน์</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>

                <button 
                  onClick={loadItems}
                  className="p-2 bg-[#101F21] border border-[#3A6360]/30 hover:bg-[#1C3033] rounded-xl text-[#B8CAC4] transition-all cursor-pointer shrink-0"
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Main Items Data Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto rounded-2xl border border-[#3A6360]/10 bg-[#101F21]/40 shadow-inner">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7A938E] gap-2">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                  <span className="text-xs">กำลังโหลดฐานข้อมูลจากระบบ Cloud...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7A938E] p-6 text-center">
                  <Database className="w-10 h-10 stroke-1 mb-2 text-[#3A6360]" />
                  <span className="text-xs font-bold text-white">ไม่พบบทความหรือรายการไอเท็ม</span>
                  <span className="text-[10px] mt-1 max-w-xs">ลองค้นหาคำอื่น หรือคลิกปุ่มบวกสีเขียวด้านซ้ายเพื่อเพิ่มข้อมูลใหม่เข้าสู่ระบบ</span>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-[#101F21] border-b border-[#3A6360]/30 text-[#7A938E] text-[10px] uppercase tracking-wider sticky top-0 z-10">
                      <th className="px-5 py-3">ภาพ / สี</th>
                      <th className="px-5 py-3">ชื่อผลงาน / บทความ</th>
                      <th className="px-5 py-3">ประเภท</th>
                      <th className="px-5 py-3">หมวดหมู่</th>
                      <th className="px-5 py-3">ราคา / เงื่อนไข</th>
                      <th className="px-5 py-3 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3A6360]/10">
                    {filteredItems.map((item) => {
                      const isLocal = String(item.id).startsWith('local_');
                      return (
                        <tr key={item.id} className="hover:bg-[#1C3033]/40 transition-colors">
                          <td className="px-5 py-3 shrink-0">
                            {item.type === 'design' ? (
                              <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#3A6360]/20 bg-[#101F21]">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-10 w-16 rounded-lg overflow-hidden border border-[#3A6360]/20">
                                {item.colors?.map((c: any, i: number) => (
                                  <span key={i} className="h-full flex-1" style={{ backgroundColor: c.hex }} title={c.hex} />
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 max-w-[240px]">
                            <div className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                              {item.title}
                              {isLocal && (
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded font-mono">LOCAL</span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#7A938E] truncate mt-0.5">{item.description}</div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                              item.type === 'design' 
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/30' 
                                : 'bg-[#3A6360]/20 text-[#B8CAC4] border border-[#3A6360]/30'
                            }`}>
                              {item.type === 'design' ? 'ดีไซน์' : 'พาเลทสี'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#B8CAC4] font-medium">{item.category}</td>
                          <td className="px-5 py-3">
                            {item.priceCondition === 'free' || !item.priceCondition ? (
                              <span className="bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold text-[10px]">FREE ฟรี</span>
                            ) : item.priceCondition === 'premium' ? (
                              <span className="bg-amber-950 text-amber-400 px-2.5 py-0.5 rounded-full font-bold text-[10px]">⭐ PREMIUM</span>
                            ) : (
                              <span className="bg-[#B86B52]/20 text-[#FF9275] border border-[#B86B52]/40 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                {item.price || 0} ฿
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditForm(item)}
                                className="p-2 bg-[#1C3033] hover:bg-[#3A6360] text-[#B8CAC4] hover:text-white rounded-lg transition-all cursor-pointer"
                                title="แก้ไข"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmItem(item)}
                                className="p-2 bg-[#1C3033] hover:bg-rose-950 hover:text-rose-400 text-[#7A938E] rounded-lg transition-all cursor-pointer"
                                title="ลบ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Embedded Form Modal for Create & Update (CRUD Panel) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1C3033] w-full max-w-4xl rounded-[28px] border border-[#3A6360]/40 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#101F21] border-b border-[#3A6360]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3A6360] animate-pulse"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  {editingItem ? 'แก้ไขข้อมูลบทความ' : 'เพิ่มบทความใหม่เข้าหน้าหลัก'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 bg-[#1C3033] hover:bg-[#B86B52]/20 text-[#7A938E] hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-5">
              
              {formError && (
                <div className="bg-rose-950/40 text-rose-300 border border-rose-800/30 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormType('design')}
                  className={`py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider border cursor-pointer ${
                    formType === 'design' 
                      ? 'bg-[#3A6360] text-white border-[#3A6360]' 
                      : 'bg-[#101F21] text-[#7A938E] border-[#3A6360]/20 hover:border-[#3A6360]/40'
                  }`}
                >
                  เรฟดีไซน์ (Design)
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('palette')}
                  className={`py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider border cursor-pointer ${
                    formType === 'palette' 
                      ? 'bg-[#3A6360] text-white border-[#3A6360]' 
                      : 'bg-[#101F21] text-[#7A938E] border-[#3A6360]/20 hover:border-[#3A6360]/40'
                  }`}
                >
                  พาเลทสี (Color Palette)
                </button>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">หัวข้อบทความ / ชื่องาน</label>
                    <input 
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="เช่น Nordic Warm Living Room"
                      className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none focus:border-[#3A6360]"
                      required
                    />
                  </div>

                  {formType === 'design' && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">สโลแกน / คำอธิบายสั้น</label>
                      <input 
                        type="text"
                        value={formSubtitle}
                        onChange={e => setFormSubtitle(e.target.value)}
                        placeholder="เช่น Minimalist Organic Warm Space"
                        className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none focus:border-[#3A6360]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">หมวดหมู่</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3 py-2 text-xs text-[#B8CAC4] focus:outline-none focus:border-[#3A6360]"
                    >
                      <option value="Modern Minimal">Modern Minimal (มินิมอลโมเดิร์น)</option>
                      <option value="Japandi Warm">Japandi Warm (ญี่ปุ่นผสมนอร์ดิกส์)</option>
                      <option value="Deep Forest Spruce">Deep Forest Spruce (โทนเขียวสงบธรรมชาติ)</option>
                      <option value="Editorial Classic">Editorial Classic (คลาสสิกตัวพิมพ์หรูหรา)</option>
                      <option value="Arctic Frost">Arctic Frost (โทนเย็นคลีนโมเดิร์น)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">คำบรรยายบทความ (Description)</label>
                    <textarea 
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      rows={3}
                      placeholder="ใส่รายละเอียดแนวคิดและจุดเด่นคู่สีที่น่าสนใจสำหรับดีไซน์นี้..."
                      className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none focus:border-[#3A6360] resize-none"
                    />
                  </div>

                  {/* PRICE CONDITION WORKFLOW */}
                  <div className="bg-[#101F21]/40 p-4 rounded-xl border border-[#3A6360]/20 space-y-3">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#7A938E] block">
                      💰 ตั้งค่าราคาและเงื่อนไขบทความ
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormPriceCondition('free');
                          setFormPrice(0);
                        }}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase cursor-pointer border ${
                          formPriceCondition === 'free' 
                            ? 'bg-emerald-900/30 text-emerald-400 border-emerald-600/40' 
                            : 'bg-[#101F21] text-[#7A938E] border-transparent'
                        }`}
                      >
                        Free (ฟรี)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPriceCondition('premium')}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase cursor-pointer border ${
                          formPriceCondition === 'premium' 
                            ? 'bg-amber-900/30 text-amber-400 border-amber-600/40' 
                            : 'bg-[#101F21] text-[#7A938E] border-transparent'
                        }`}
                      >
                        Premium
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormPriceCondition('paid')}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase cursor-pointer border ${
                          formPriceCondition === 'paid' 
                            ? 'bg-[#B86B52]/20 text-[#FF9275] border-[#B86B52]/40' 
                            : 'bg-[#101F21] text-[#7A938E] border-transparent'
                        }`}
                      >
                        มีราคาตั้ง
                      </button>
                    </div>

                    {formPriceCondition === 'paid' && (
                      <div className="pt-1.5">
                        <label className="block text-[9px] font-bold text-[#7A938E] mb-1">ระบุราคาตั้ง (บาท)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            value={formPrice}
                            onChange={e => setFormPrice(Number(e.target.value))}
                            placeholder="เช่น 199"
                            min={0}
                            className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-lg pl-8 pr-4 py-1.5 text-xs text-white focus:outline-none"
                          />
                          <DollarSign className="w-3.5 h-3.5 text-[#7A938E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Fields */}
                <div className="space-y-4">
                  {formType === 'design' ? (
                    <>
                      {/* Image Upload Block */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1 flex justify-between">
                          <span>อัปโหลดรูปภาพเรฟใหม่</span>
                          <span className="text-amber-400 font-normal">บีบอัดอัตโนมัติ</span>
                        </label>
                        
                        <div className="flex gap-2 items-center">
                          <input 
                            type="text"
                            value={formImageUrl}
                            onChange={e => setFormImageUrl(e.target.value)}
                            placeholder="หรือใส่ที่อยู่ลิงก์รูปภาพ..."
                            className="flex-1 bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none"
                          />
                          
                          <label className="px-3.5 py-2 bg-[#3A6360] hover:bg-[#4E8480] text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>เลือกไฟล์</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {uploadProgress && (
                          <div className="text-[10px] text-amber-400 mt-1 animate-pulse">กำลังอ่านไฟล์ภาพและประมวลผลย่อขนาด...</div>
                        )}

                        {/* Image Preview Window */}
                        <div className="mt-2.5 aspect-video w-full rounded-xl border border-[#3A6360]/20 bg-[#101F21] overflow-hidden relative">
                          {formImageUrl ? (
                            <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#7A938E] text-[11px] gap-1">
                              <ImageIcon className="w-6 h-6 stroke-1.5" />
                              <span>ยังไม่ได้เลือกไฟล์รูปภาพ</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Design specific - Color Chips */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1.5">โทนสีชุดประกอบดีไซน์ (5 สีแฮชแท็ก)</label>
                        <div className="grid grid-cols-5 gap-2 bg-[#101F21] p-3 rounded-xl border border-[#3A6360]/20">
                          {designPalette.map((color, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className="w-8 h-8 rounded-full border border-white/20 relative cursor-pointer shadow-sm overflow-hidden" style={{ backgroundColor: color }}>
                                <input 
                                  type="color" 
                                  value={color}
                                  onChange={e => updateDesignPaletteColor(idx, e.target.value)}
                                  className="absolute opacity-0 scale-150 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text"
                                value={color}
                                onChange={e => updateDesignPaletteColor(idx, e.target.value)}
                                className="w-full text-center bg-transparent text-[8px] font-mono border-none p-0 uppercase focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Design specific - Typography & Layout Notes */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">ฟอนต์หัวเรื่อง</label>
                          <input 
                            type="text"
                            value={typographyHeading}
                            onChange={e => setTypographyHeading(e.target.value)}
                            className="w-full bg-[#101F21] border border-[#3A6360]/20 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">ฟอนต์เนื้อหา</label>
                          <input 
                            type="text"
                            value={typographyBody}
                            onChange={e => setTypographyBody(e.target.value)}
                            className="w-full bg-[#101F21] border border-[#3A6360]/20 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">แนวอารมณ์ฟอนต์</label>
                          <input 
                            type="text"
                            value={typographyVibe}
                            onChange={e => setTypographyVibe(e.target.value)}
                            className="w-full bg-[#101F21] border border-[#3A6360]/20 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">แนวทางการจัดหน้าเลย์เอาต์ (บรรทัดละข้อ)</label>
                        <textarea 
                          value={layoutNotesInput}
                          onChange={e => setLayoutNotesInput(e.target.value)}
                          rows={2}
                          className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none resize-none font-sans"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Palette specific - Editable Colors with names and roles */}
                      <div className="space-y-3">
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E]">
                          ตั้งค่าแถบสีและสัดส่วน (5 แถบสีพรีเมียม)
                        </label>
                        
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {paletteColors.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-[#101F21] p-2 rounded-xl border border-[#3A6360]/20">
                              {/* Native color picker box */}
                              <div className="w-10 h-10 rounded-lg border border-white/15 relative overflow-hidden shrink-0" style={{ backgroundColor: color.hex }}>
                                <input 
                                  type="color"
                                  value={color.hex}
                                  onChange={e => updatePaletteColorField(idx, 'hex', e.target.value)}
                                  className="absolute opacity-0 scale-150 cursor-pointer"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 flex-1">
                                <div>
                                  <label className="block text-[8px] text-[#7A938E]">รหัสสี (HEX)</label>
                                  <input 
                                    type="text"
                                    value={color.hex}
                                    onChange={e => updatePaletteColorField(idx, 'hex', e.target.value)}
                                    className="w-full bg-[#1C3033] border-none text-[10px] text-[#B8CAC4] font-mono px-1.5 py-1 rounded focus:outline-none uppercase"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] text-[#7A938E]">ชื่อเรียกสี</label>
                                  <input 
                                    type="text"
                                    value={color.name}
                                    onChange={e => updatePaletteColorField(idx, 'name', e.target.value)}
                                    placeholder="เช่น Snow"
                                    className="w-full bg-[#1C3033] border-none text-[10px] text-white px-1.5 py-1 rounded focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] text-[#7A938E]">สัดส่วน/หน้าที่ใช้งาน</label>
                                  <input 
                                    type="text"
                                    value={color.role}
                                    onChange={e => updatePaletteColorField(idx, 'role', e.target.value)}
                                    placeholder="เช่น Background 60%"
                                    className="w-full bg-[#1C3033] border-none text-[10px] text-white px-1.5 py-1 rounded focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#7A938E] mb-1">แท็ก (Tags คั่นด้วยเครื่องหมายคอมมา ,)</label>
                    <input 
                      type="text"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      placeholder="เช่น Web UI, Minimal, Cozy, Cool Tone"
                      className="w-full bg-[#101F21] border border-[#3A6360]/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#5C7276] focus:outline-none focus:border-[#3A6360]"
                    />
                  </div>
                </div>

              </div>

              {/* Action Submit Buttons */}
              <div className="pt-4 border-t border-[#3A6360]/20 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-[#1C3033] border border-[#3A6360]/30 hover:bg-[#253D41] rounded-xl text-xs text-[#B8CAC4] font-medium transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#3A6360] hover:bg-[#4E8480] text-[#142325] rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-1 text-white"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังบันทึกข้อมูล...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'บันทึกการแก้ไข' : 'สร้างบทความเข้าฐานข้อมูล'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Custom Deletion Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1C3033] w-full max-w-md rounded-3xl border border-[#B86B52]/30 shadow-2xl overflow-hidden animate-in scale-in duration-200">
            {/* Warning Header */}
            <div className="p-6 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-[#B86B52]/10 border border-[#B86B52]/30 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-[#FF8E75]" />
              </div>
              <h3 className="text-lg font-serif italic text-white font-medium mb-1.5">
                ยืนยันการลบข้อมูล
              </h3>
              <p className="text-xs text-[#7A938E] leading-relaxed">
                คุณแน่ใจหรือไม่ที่จะลบรายการข้อมูลนี้ออกจากระบบอย่างถาวร?
              </p>
            </div>

            {/* Target Item Brief Info Card */}
            <div className="mx-6 p-4 bg-[#101F21] rounded-2xl border border-[#3A6360]/20 flex items-center gap-3">
              {deleteConfirmItem.type === 'design' ? (
                <img 
                  src={deleteConfirmItem.imageUrl} 
                  alt={deleteConfirmItem.title} 
                  className="w-12 h-12 rounded-xl object-cover border border-[#3A6360]/20 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#3A6360]/20 flex flex-wrap shrink-0">
                  {deleteConfirmItem.colors?.map((c: any, i: number) => (
                    <span key={i} className="h-full flex-1" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#7A938E] block">
                  {deleteConfirmItem.type === 'design' ? 'เรฟดีไซน์' : 'พาเลทสี'}
                </span>
                <h4 className="text-xs font-bold text-white truncate">
                  {deleteConfirmItem.title}
                </h4>
                <p className="text-[10px] text-[#5C7276] truncate">
                  {deleteConfirmItem.category}
                </p>
              </div>
            </div>

            {/* Alert info banner */}
            <div className="mx-6 mt-3 bg-[#B86B52]/5 border border-[#B86B52]/10 p-3 rounded-xl text-[10px] text-[#FF8E75]/80 flex gap-2">
              <span className="font-bold">⚠️</span>
              <span>การลบนี้จะถูกอัปเดตแบบเรียลไทม์ และสมาชิกจะไม่สามารถเรียกดูข้อมูลรายการนี้ได้อีกต่อไป</span>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-4 flex gap-3">
              <button
                type="button"
                disabled={deletingProgress}
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-3 bg-[#1C3033] hover:bg-[#253D41] border border-[#3A6360]/20 rounded-xl text-xs text-[#B8CAC4] font-medium transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={deletingProgress}
                onClick={() => handleDeleteItem(deleteConfirmItem.id)}
                className="flex-1 py-3 bg-[#B86B52]/10 hover:bg-[#B86B52]/30 border border-[#B86B52]/40 text-[#FF8E75] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deletingProgress ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยืนยันการลบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[120] animate-in slide-in-from-bottom duration-300">
          <div className={`px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/40' 
              : 'bg-rose-950/90 text-rose-300 border-rose-800/40'
          }`}>
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="p-0.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
