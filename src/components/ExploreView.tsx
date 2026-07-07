import React, { useState } from 'react';
import { ReferenceDesign } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';
import { Sparkles, Search, SlidersHorizontal, Plus, Globe } from 'lucide-react';

interface ExploreViewProps {
  references: ReferenceDesign[];
  communityDesigns: ReferenceDesign[];
  onSelectReference: (design: ReferenceDesign) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onOpenAIAssistant: (initialPrompt?: string) => void;
  onOpenAddModal: () => void;
}

const CATEGORIES = ['ทั้งหมด', 'Graphic Design', 'Digital Media', 'Product Design', 'UI/UX & Web', 'Packaging', 'Interior & Architecture'];

export const ExploreView: React.FC<ExploreViewProps> = ({
  references,
  communityDesigns,
  onSelectReference,
  onToggleBookmark,
  onOpenAIAssistant,
  onOpenAddModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ทั้งหมด');
  const [sourceTab, setSourceTab] = useState<'curated' | 'community'>('curated');

  const activeCollection = sourceTab === 'curated' ? references : communityDesigns;

  const filtered = activeCollection.filter(ref => {
    const matchesSearch = searchQuery === '' || 
      ref.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCat === 'ทั้งหมด' || ref.category === selectedCat;

    return matchesSearch && matchesCat;
  });

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 md:p-10 overflow-hidden bg-[#F4F7F6]">
      {/* Header section matching exact design HTML */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-[#1E2E31] mb-1.5 font-normal tracking-tight">
            สวัสดี, วันนี้อยากได้แรงบันดาลใจแบบไหน?
          </h1>
          <p className="text-[#5C7276] text-xs sm:text-sm lg:text-base font-serif">
            ค้นหาเรฟเฟอร์เรตสำหรับการออกแบบที่เรียบง่ายและทันสมัย คุมโทนสีและมู้ดดีไซน์โทนเย็น
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-[#7A938E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา: มินิมอล, โทนเย็น, สระ..." 
              className="bg-[#DDE5E4]/80 border-none rounded-full pl-11 pr-6 py-2.5 sm:py-3 w-full sm:w-64 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none placeholder-[#7A938E] text-[#1E2E31] transition-shadow"
            />
          </div>

          <button 
            onClick={() => onOpenAIAssistant("แนะนำเรฟดีไซน์และโทนสีมินิมอลโมเดิร์นโทนเย็นสำหรับปรึกษางานใหม่ให้หน่อย")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-[#3A6360] text-white hover:bg-[#2C4B49] text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2E8B90] animate-pulse" />
            <span>ปรึกษา AI</span>
          </button>

          <button 
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-[#1E2E31] text-white hover:bg-black text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#B8CAC4]" />
            <span>แชร์ผลงานใหม่</span>
          </button>
        </div>
      </header>

      {/* Source Collection Switcher */}
      <div className="flex bg-[#DDE5E4]/60 p-1 rounded-xl mb-4 w-fit border border-[#D1DDD9]/30 shrink-0">
        <button
          onClick={() => {
            setSourceTab('curated');
            setSelectedCat('ทั้งหมด');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
            sourceTab === 'curated'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>แนะนำโดยสตูดิโอ ({references.length})</span>
        </button>
        <button
          onClick={() => {
            setSourceTab('community');
            setSelectedCat('ทั้งหมด');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
            sourceTab === 'community'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>ผลงานจากชุมชน ({communityDesigns.length})</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 shrink-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-[#1E2E31] text-white shadow-xs'
                : 'bg-[#DDE5E4] text-[#5C7276] hover:bg-[#D1DDD9] hover:text-[#1E2E31]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid View */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 mb-6 overflow-y-auto pr-1 pb-4">
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <ReferenceCard 
              key={item.id}
              design={item}
              index={idx}
              onSelect={onSelectReference}
              onToggleBookmark={onToggleBookmark}
            />
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-[#EBF1F0] rounded-[28px] border border-dashed border-[#B8CAC4] p-6">
            <Search className="w-10 h-10 text-[#7A938E] mb-3 stroke-1" />
            <h4 className="text-base font-serif italic text-[#3A6360]">ไม่พบเรฟเฟอร์เรตที่ตรงกับ "{searchQuery}"</h4>
            <p className="text-xs text-[#5C7276] mt-1 max-w-sm">ลองเปลี่ยนคำค้นหา หรือให้ AI ช่วยสร้างไอเดียมู้ดบอร์ดชุดใหม่ให้คุณ</p>
            <button
              onClick={() => onOpenAIAssistant(`สร้างเรฟดีไซน์และพาเลทสีใหม่สำหรับ "${searchQuery}"`)}
              className="mt-4 px-5 py-2 bg-[#3A6360] text-white text-xs font-bold rounded-xl hover:bg-[#1E2E31] transition-colors"
            >
              ✨ ให้ AI วิเคราะห์โจทย์นี้
            </button>
          </div>
        )}
      </section>

    </main>
  );
};
