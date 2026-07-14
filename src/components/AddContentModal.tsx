import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image, Palette, Sparkles, Loader2, Check, Type, Info, Plus, Trash2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase.ts';

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onPromptSignIn: () => void;
  onSuccess: () => void;
  editItem?: any;
}

const CATEGORIES = [
  'Graphic Design',
  'Digital Media',
  'Product Design',
  'UI/UX & Web',
  'Packaging',
  'Interior & Architecture'
];

export const AddContentModal: React.FC<AddContentModalProps> = ({
  isOpen,
  onClose,
  user,
  onPromptSignIn,
  onSuccess,
  editItem
}) => {
  const [contentType, setContentType] = useState<'design' | 'palette'>('design');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Common Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Graphic Design');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Design Specific Fields
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [designPalette, setDesignPalette] = useState<string[]>(['#EBF1F0', '#B8CAC4', '#7A938E', '#3A6360', '#1E2E31']);
  const [typographyHeading, setTypographyHeading] = useState('Space Grotesk');
  const [typographyBody, setTypographyBody] = useState('Inter');
  const [typographyVibe, setTypographyVibe] = useState('Clean & Tech-forward');
  const [layoutNotesInput, setLayoutNotesInput] = useState('');

  // Palette Specific Fields
  const [paletteColors, setPaletteColors] = useState([
    { hex: '#F4F7F6', name: 'Cotton Frost', role: 'Background 60%' },
    { hex: '#EBF1F0', name: 'Ice Mint', role: 'Surface 25%' },
    { hex: '#B8CAC4', name: 'Sage Mist', role: 'Border 8%' },
    { hex: '#3A6360', name: 'Slate Spruce', role: 'Accent 5%' },
    { hex: '#1E2E31', name: 'Deep Abyss', role: 'Text 2%' }
  ]);

  useEffect(() => {
    if (editItem) {
      setContentType(editItem.type || 'design');
      setTitle(editItem.title || '');
      setCategory(editItem.category || 'Graphic Design');
      setDescription(editItem.description || '');
      setTagsInput(editItem.tags ? editItem.tags.join(', ') : '');
      
      if (editItem.type === 'design') {
        setSubtitle(editItem.subtitle || '');
        setImageUrl(editItem.imageUrl || '');
        setDesignPalette(editItem.palette || ['#EBF1F0', '#B8CAC4', '#7A938E', '#3A6360', '#1E2E31']);
        setTypographyHeading(editItem.typography?.heading || 'Space Grotesk');
        setTypographyBody(editItem.typography?.body || 'Inter');
        setTypographyVibe(editItem.typography?.vibe || 'Clean & Tech-forward');
        setLayoutNotesInput(editItem.layoutNotes ? editItem.layoutNotes.join('\n') : '');
      } else {
        setPaletteColors(editItem.colors || [
          { hex: '#F4F7F6', name: 'Cotton Frost', role: 'Background 60%' },
          { hex: '#EBF1F0', name: 'Ice Mint', role: 'Surface 25%' },
          { hex: '#B8CAC4', name: 'Sage Mist', role: 'Border 8%' },
          { hex: '#3A6360', name: 'Slate Spruce', role: 'Accent 5%' },
          { hex: '#1E2E31', name: 'Deep Abyss', role: 'Text 2%' }
        ]);
      }
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Drag Events for File Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  // Convert and proxy upload to Cloudinary via server API
  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกเฉพาะไฟล์รูปภาพ (PNG, JPG, WEBP)');
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          setImageUrl(data.url);
        } else {
          alert('อัปโหลดล้มเหลว: ' + (data.error || 'กรุณาลองใหม่อีกครั้ง'));
        }
        setUploadingImage(false);
      };
    } catch (err) {
      console.error('Error during image conversion or upload:', err);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      setUploadingImage(false);
    }
  };

  const handleDesignPaletteChange = (index: number, val: string) => {
    setDesignPalette(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handlePaletteColorChange = (index: number, field: 'hex' | 'name' | 'role', val: string) => {
    setPaletteColors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Submit Content to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onPromptSignIn();
      return;
    }

    if (!title.trim()) {
      alert('กรุณากรอกชื่อผลงาน / พาเลทสี');
      return;
    }

    if (contentType === 'design' && !imageUrl) {
      alert('กรุณาอัปโหลดรูปภาพผลงาน');
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const parsedLayoutNotes = layoutNotesInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const docData: any = {
        title,
        category,
        description,
        type: contentType,
        tags: tags.length > 0 ? tags : [contentType === 'design' ? 'Design' : 'Palette', category],
        userId: editItem ? (editItem.userId || user.uid) : user.uid,
        userEmail: editItem ? (editItem.userEmail || user.email || '') : (user.email || ''),
        userName: editItem ? (editItem.userName || user.displayName || 'Designer') : (user.displayName || 'Designer'),
        userPhoto: editItem ? (editItem.userPhoto || user.photoURL || '') : (user.photoURL || ''),
      };

      if (!editItem) {
        docData.likes = 0;
        docData.createdAt = serverTimestamp();
      } else {
        docData.updatedAt = serverTimestamp();
      }

      if (contentType === 'design') {
        docData.subtitle = subtitle || category;
        docData.imageUrl = imageUrl;
        docData.palette = designPalette;
        docData.typography = {
          heading: typographyHeading || 'Space Grotesk',
          body: typographyBody || 'Inter',
          vibe: typographyVibe || 'Nordic Simple'
        };
        docData.layoutNotes = parsedLayoutNotes.length > 0 ? parsedLayoutNotes : [
          'ควบคุมกริดระยะเว้นระยะ Margin ให้กว้าง',
          'เลือกใช้คู่น้ำหนัก Contrast ของสีอย่างระมัดระวัง'
        ];
      } else {
        docData.colors = paletteColors.map(c => ({
          hex: c.hex,
          name: c.name || 'Custom Color',
          role: c.role || 'Secondary Decor'
        }));
      }

      // Add or Edit in Firestore collection "My Desing" as requested
      try {
        if (editItem) {
          const isLocal = String(editItem.id).startsWith('local_');
          if (isLocal) {
            const existingLocalStr = localStorage.getItem('community_items_local');
            const existingLocal = existingLocalStr ? JSON.parse(existingLocalStr) : [];
            const updatedLocal = existingLocal.map((item: any) => 
              item.id === editItem.id ? { 
                ...item, 
                ...docData, 
                createdAt: item.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString() 
              } : item
            );
            localStorage.setItem('community_items_local', JSON.stringify(updatedLocal));
            window.dispatchEvent(new Event('local_community_items_updated'));
          } else {
            const docRef = doc(db, 'My Desing', editItem.id);
            await updateDoc(docRef, docData);
          }
        } else {
          await addDoc(collection(db, 'My Desing'), docData);
        }
      } catch (err: any) {
        console.warn('Utilizing local storage backup for client-side persistence:', err);
        // Save locally to localStorage so it is instantly available and preserved offline!
        const existingLocalStr = localStorage.getItem('community_items_local');
        const existingLocal = existingLocalStr ? JSON.parse(existingLocalStr) : [];
        
        if (editItem) {
          const updatedLocal = existingLocal.map((item: any) => 
            item.id === editItem.id ? { 
              ...item, 
              ...docData, 
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            } : item
          );
          localStorage.setItem('community_items_local', JSON.stringify(updatedLocal));
        } else {
          const newLocalItem = {
            id: 'local_' + Date.now(),
            ...docData,
            createdAt: new Date().toISOString() // ISO string for local sorting
          };
          const updatedLocal = [newLocalItem, ...existingLocal];
          localStorage.setItem('community_items_local', JSON.stringify(updatedLocal));
        }
        
        window.dispatchEvent(new Event('local_community_items_updated'));

        // Inform the user about the cloud sync failure and local fallback
        alert(
          `⚠️ บันทึกข้อมูลสำเร็จเฉพาะในเครื่องของคุณ (Local Storage)!\n\n` +
          `หมายเหตุ: ข้อมูลนี้ยังไม่สามารถส่งขึ้นระบบ Cloud Firestore ได้เนื่องจากข้อผิดพลาด:\n` +
          `"${err.message || err}"\n\n` +
          `คำแนะนำ:\n` +
          `1. โปรดตรวจสอบว่าได้ล็อกอินผ่านบัญชี Google เรียบร้อยแล้ว\n` +
          `2. ตรวจสอบว่าระบบ Cloud Firestore ได้รับการเปิดใช้งานและสร้างฐานข้อมูลเรียบร้อยแล้ว\n` +
          `3. ตรวจสอบว่ากฎความปลอดภัย (Security Rules) ในโปรเจกต์ของคุณอนุญาตให้เขียนข้อมูลชุดนี้`
        );
      }
      
      // Reset State & Notify Success
      resetForm();
      onSuccess();
    } catch (err: any) {
      console.error('Firestore save error:', err);
      alert('ไม่สามารถบันทึกผลงานลงฐานข้อมูลได้: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  function resetForm() {
    setTitle('');
    setCategory('Graphic Design');
    setDescription('');
    setTagsInput('');
    setSubtitle('');
    setImageUrl('');
    setDesignPalette(['#EBF1F0', '#B8CAC4', '#7A938E', '#3A6360', '#1E2E31']);
    setTypographyHeading('Space Grotesk');
    setTypographyBody('Inter');
    setTypographyVibe('Clean & Tech-forward');
    setLayoutNotesInput('');
    setPaletteColors([
      { hex: '#F4F7F6', name: 'Cotton Frost', role: 'Background 60%' },
      { hex: '#EBF1F0', name: 'Ice Mint', role: 'Surface 25%' },
      { hex: '#B8CAC4', name: 'Sage Mist', role: 'Border 8%' },
      { hex: '#3A6360', name: 'Slate Spruce', role: 'Accent 5%' },
      { hex: '#1E2E31', name: 'Deep Abyss', role: 'Text 2%' }
    ]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 border border-[#D1DDD9] shadow-2xl flex flex-col relative my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#D1DDD9] pb-4 mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#7A938E]">Community Showcase</span>
            <h2 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] mt-1 font-bold">
              {editItem ? 'แก้ไขผลงานที่แชร์ ✏️' : 'แชร์ผลงานใหม่ของคุณ 🚀'}
            </h2>
            <p className="text-xs text-[#5C7276] mt-0.5">
              {editItem ? 'ปรับปรุงรายละเอียดผลงานดีไซน์หรือพาเลทสีของคุณให้สมบูรณ์ยิ่งขึ้น' : 'แสดงไอเดียงานดีไซน์หรือพาเลทสีโทนเย็น เพื่อแชร์สร้างแรงบันดาลใจให้เพื่อนๆ ดีไซเนอร์'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-[#F4F7F6] hover:bg-[#DDE5E4] text-[#1E2E31] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Guard Warning */}
        {!user && (
          <div className="bg-[#EBF1F0] border border-[#D1DDD9] p-4 rounded-xl mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#3A6360] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-[#1E2E31]">กรุณาเข้าสู่ระบบก่อนอัปโหลด</p>
              <p className="text-[#5C7276] mt-0.5">เพื่อคุมความปลอดภัยและสามารถแสดงเครดิตภาพของคุณ ดีไซเนอร์จะต้องเข้าสู่ระบบผ่าน Google ก่อน</p>
              <button 
                onClick={() => {
                  onClose();
                  onPromptSignIn();
                }}
                className="mt-2 text-xs font-bold text-[#3A6360] hover:underline"
              >
                เข้าสู่ระบบเลยตอนนี้ &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Content Type Selector Tabs */}
        <div className="grid grid-cols-2 bg-[#F4F7F6] p-1 rounded-xl mb-6 border border-[#D1DDD9]/60">
          <button
            type="button"
            disabled={!!editItem}
            onClick={() => setContentType('design')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              contentType === 'design'
                ? 'bg-white text-[#1E2E31] shadow-xs'
                : 'text-[#7A938E] hover:text-[#1E2E31]'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>งานดีไซน์เรฟเฟอร์เรนซ์</span>
          </button>
          <button
            type="button"
            disabled={!!editItem}
            onClick={() => setContentType('palette')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              contentType === 'palette'
                ? 'bg-white text-[#1E2E31] shadow-xs'
                : 'text-[#7A938E] hover:text-[#1E2E31]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>พาเลทสีที่คิดเอง</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
              ชื่อผลงาน / พาเลทสีของคุณ *
            </label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Minimal Glacier Villa, Cool Slate UI design, Matcha Soft Cream..."
              className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
            />
          </div>

          {/* Subtitle Field (Only for designs) */}
          {contentType === 'design' && (
            <div>
              <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
                สโลแกนหรือคำนิยามสั้นๆ
              </label>
              <input 
                type="text" 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="เช่น การจัดวางกริดเรียบง่ายสไตล์นอร์ดิกเพื่อรีสอร์ทส่วนตัว"
                className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
              />
            </div>
          )}

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
                หมวดหมู่หลัก
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
              >
                {contentType === 'design' ? (
                  CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  ['Earth Tone', 'Cool Tone', 'Frozen Arctic', 'Ocean Aqua', 'Forest Sage', 'Modern Slate', 'Minimalist'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
                ป้ายกำกับ (คั่นด้วยเครื่องหมายจุลภาค ,)
              </label>
              <input 
                type="text" 
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="เช่น คลีน, เย็น, โฮมมี่, นิ่งสงบ"
                className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
              คำอธิบายรายละเอียด
            </label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายแนวคิดเบื้องหลังการเลือกสี เส้นสาย มู้ดแอนด์โทนของผลงานชิ้นนี้..."
              className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31] resize-none"
            />
          </div>

          {/* IMAGE UPLOAD & DESIGN PALETTE/TYPO (ONLY DESIGN TYPE) */}
          {contentType === 'design' && (
            <div className="space-y-4 pt-2 border-t border-[#D1DDD9]/60">
              
              {/* Drag-and-drop file upload */}
              <div>
                <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
                  อัปโหลดรูปภาพผลงานของคุณ *
                </label>
                
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#D1DDD9] bg-[#F4F7F6] group aspect-video max-h-56">
                    <img 
                      src={imageUrl} 
                      alt="Uploaded preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                        title="ลบรูปภาพ"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                      dragActive 
                        ? 'border-[#3A6360] bg-[#EBF1F0]' 
                        : 'border-[#D1DDD9] hover:border-[#B8CAC4] hover:bg-[#F4F7F6]'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3 text-[#3A6360]">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">กำลังอัปโหลดไปยัง Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[#7A938E]" />
                        <p className="text-xs font-bold text-[#1E2E31]">ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อค้นหาไฟล์</p>
                        <p className="text-[10px] text-[#7A938E]">รองรับเฉพาะรูปภาพขนาดสูงสุด 10MB (PNG, JPG, WEBP)</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Design Main Palette 5 color selection */}
              <div>
                <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-2">
                  แต่งจานสีประกอบผลงาน (5 เฉดสีหลักเพื่อใช้พรีวิว)
                </label>
                <div className="grid grid-cols-5 gap-2 bg-[#F4F7F6] p-3 rounded-xl border border-[#D1DDD9]">
                  {designPalette.map((col, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <div 
                        style={{ backgroundColor: col }} 
                        className="w-full h-10 rounded-lg border border-black/10 relative overflow-hidden group shadow-inner"
                      >
                        <input 
                          type="color" 
                          value={col}
                          onChange={(e) => handleDesignPaletteChange(idx, e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1E2E31] uppercase">{col}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Design Typography pairing option */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#1E2E31] uppercase tracking-wider">คู่ฟอนต์แนะนำสำหรับสไตล์งานนี้</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A938E] uppercase mb-1">ฟอนต์หัวข้อหลัก (Heading)</label>
                    <input 
                      type="text" 
                      value={typographyHeading}
                      onChange={(e) => setTypographyHeading(e.target.value)}
                      placeholder="เช่น Outfit / Space Grotesk"
                      className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A938E] uppercase mb-1">ฟอนต์เนื้อหา (Body)</label>
                    <input 
                      type="text" 
                      value={typographyBody}
                      onChange={(e) => setTypographyBody(e.target.value)}
                      placeholder="เช่น Inter / Prompt"
                      className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7A938E] uppercase mb-1">มู้ดอารมณ์ฟอนต์ (Vibe)</label>
                    <input 
                      type="text" 
                      value={typographyVibe}
                      onChange={(e) => setTypographyVibe(e.target.value)}
                      placeholder="เช่น มินิมอล, ดุดัน, อบอุ่น"
                      className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-3 py-2 text-xs focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
                    />
                  </div>
                </div>
              </div>

              {/* Layout tips */}
              <div>
                <label className="block text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-1.5">
                  เทคนิคเลย์เอาต์ (หนึ่งข้อความต่อหนึ่งบรรทัด)
                </label>
                <textarea 
                  rows={2}
                  value={layoutNotesInput}
                  onChange={(e) => setLayoutNotesInput(e.target.value)}
                  placeholder="เช่น เว้นขอบจอกว้างอย่างน้อย 32px เพื่อให้ความรู้สึกสงบ&#10;คุมความขุ่นของฟิลเตอร์เบลอหลังไว้ที่ 10px เสมอ"
                  className="w-full bg-[#F4F7F6] border border-[#D1DDD9] rounded-xl px-4 py-2 text-xs focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31] resize-none"
                />
              </div>

            </div>
          )}

          {/* PALETTE DETAILED PICKERS (ONLY PALETTE TYPE) */}
          {contentType === 'palette' && (
            <div className="space-y-4 pt-2 border-t border-[#D1DDD9]/60">
              <p className="text-xs font-bold text-[#1E2E31] uppercase tracking-wider mb-2">กำหนด 5 แถบสี พร้อมชื่อและคำอธิบายสัดส่วน</p>
              
              <div className="space-y-3.5">
                {paletteColors.map((col, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#F4F7F6] p-3 rounded-xl border border-[#D1DDD9]">
                    
                    {/* Color Circle Picker */}
                    <div className="relative w-12 h-12 rounded-xl border border-black/10 overflow-hidden shrink-0 shadow-inner">
                      <div style={{ backgroundColor: col.hex }} className="w-full h-full"></div>
                      <input 
                        type="color" 
                        value={col.hex}
                        onChange={(e) => handlePaletteColorChange(idx, 'hex', e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <div>
                        <label className="block text-[9px] font-bold text-[#7A938E] uppercase mb-0.5">รหัสสี Hex</label>
                        <input 
                          type="text" 
                          value={col.hex}
                          onChange={(e) => handlePaletteColorChange(idx, 'hex', e.target.value)}
                          className="w-full bg-white border border-[#D1DDD9] rounded-lg px-2.5 py-1 text-xs font-mono focus:ring-1 ring-[#3A6360] outline-none text-[#1E2E31] uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#7A938E] uppercase mb-0.5">ชื่อเฉดสี</label>
                        <input 
                          type="text" 
                          value={col.name}
                          onChange={(e) => handlePaletteColorChange(idx, 'name', e.target.value)}
                          placeholder="เช่น Cotton Soft"
                          className="w-full bg-white border border-[#D1DDD9] rounded-lg px-2.5 py-1 text-xs focus:ring-1 ring-[#3A6360] outline-none text-[#1E2E31]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#7A938E] uppercase mb-0.5">บทบาท/สัดส่วน</label>
                        <input 
                          type="text" 
                          value={col.role}
                          onChange={(e) => handlePaletteColorChange(idx, 'role', e.target.value)}
                          placeholder="เช่น Accent 5%"
                          className="w-full bg-white border border-[#D1DDD9] rounded-lg px-2.5 py-1 text-xs focus:ring-1 ring-[#3A6360] outline-none text-[#1E2E31]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color layout preview bar */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#7A938E] uppercase">ตัวอย่างพาเลทที่คุณปรับแต่ง:</span>
                <div className="h-10 rounded-xl overflow-hidden flex border border-black/5">
                  {paletteColors.map((col, idx) => (
                    <div 
                      key={idx} 
                      style={{ backgroundColor: col.hex, width: '20%' }} 
                      className="h-full relative group transition-all"
                      title={col.name}
                    ></div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D1DDD9] justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-[#5C7276] hover:text-[#1E2E31] bg-[#F4F7F6] hover:bg-[#DDE5E4] rounded-xl transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2.5 bg-[#3A6360] hover:bg-[#1E2E31] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{editItem ? 'กำลังบันทึกการแก้ไข...' : 'กำลังแชร์ลงบอร์ด...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#2E8B90] animate-pulse" />
                  <span>{editItem ? 'บันทึกการแก้ไข' : 'แชร์งานดีไซน์ / พาเลทสี'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
