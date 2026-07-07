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
    <main className="flex-1 flex flex-col p-3 sm:p-5 md:p-6 overflow-hidden bg-[#F4F7F6]">
      {/* Header section matching exact design HTML */}
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-[#1E2E31] mb-0.5 font-normal tracking-tight">
            สวัสดี, วันนี้อยากได้แรงบันดาลใจแบบไหน?
          </h1>
          <p className="text-[#5C7276] text-xs sm:text-xs lg:text-sm font-serif">
            ค้นหาเรฟเฟอร์เรตสำหรับการออกแบบที่เรียบง่ายและทันสมัย คุมโทนสีและมู้ดดีไซน์โทนเย็น
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-initial">
            <Search className="w-3.5 h-3.5 text-[#7A938E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา: มินิมอล, โทนเย็น, สระ..." 
              className="bg-[#DDE5E4]/80 border-none rounded-full pl-10 pr-5 py-2 w-full lg:w-60 text-xs sm:text-xs focus:ring-2 ring-[#3A6360] outline-none placeholder-[#7A938E] text-[#1E2E31] transition-shadow"
            />
          </div>
        </div>
      </header>

      {/* Source Collection Switcher */}
      <div className="flex bg-[#DDE5E4]/60 p-0.5 rounded-lg mb-3 w-fit border border-[#D1DDD9]/30 shrink-0">
        <button
          onClick={() => {
            setSourceTab('curated');
            setSelectedCat('ทั้งหมด');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            sourceTab === 'curated'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>แนะนำโดยสตูดิโอ ({references.length})</span>
        </button>
        <button
          onClick={() => {
            setSourceTab('community');
            setSelectedCat('ทั้งหมด');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            sourceTab === 'community'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Globe className="w-3 h-3" />
          <span>ผลงานจากชุมชน ({communityDesigns.length})</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 shrink-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
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
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 mb-4 overflow-y-auto pr-1 pb-4">
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
