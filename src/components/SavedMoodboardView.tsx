import React from 'react';
import { ReferenceDesign, ColorPalette } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';
import { Bookmark, Sparkles, Heart } from 'lucide-react';

interface SavedMoodboardViewProps {
  savedReferences: ReferenceDesign[];
  onSelectReference: (design: ReferenceDesign) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onExploreMore: () => void;
}

export const SavedMoodboardView: React.FC<SavedMoodboardViewProps> = ({
  savedReferences,
  onSelectReference,
  onToggleBookmark,
  onExploreMore
}) => {
  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 md:p-10 overflow-y-auto bg-[#F4F7F6]">
      <header className="mb-8">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#7A938E]">Your Workspace Moodboard</span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-[#1E2E31] mt-1 flex items-center gap-3">
          <span>มู้ดบอร์ด & คลังเรฟที่บันทึกไว้</span>
          <span className="text-xs font-sans not-italic bg-[#D1DDD9] text-[#3A6360] px-3 py-1 rounded-full font-bold">
            {savedReferences.length} ไอเทม
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-[#5C7276] mt-2 max-w-xl">
          รวบรวมเรฟเฟอร์เรตและโทนสีที่คุณเลือกไว้เพื่อนำไปใช้ตกแต่งกราฟิกหรือจัดเลย์เอาต์งานดีไซน์จริงในสไตล์โทนเย็น
        </p>
      </header>

      {savedReferences.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
          {savedReferences.map((item, idx) => (
            <ReferenceCard 
              key={item.id}
              design={item}
              index={idx}
              onSelect={onSelectReference}
              onToggleBookmark={onToggleBookmark}
            />
          ))}
        </section>
      ) : (
        <div className="py-16 bg-[#EBF1F0] rounded-[28px] border border-dashed border-[#B8CAC4] flex flex-col items-center justify-center text-center p-6 sm:p-8">
          <div className="w-14 h-14 rounded-full bg-[#D1DDD9] flex items-center justify-center text-[#3A6360] mb-4 shadow-inner">
            <Bookmark className="w-6 h-6 stroke-1.5" />
          </div>
          <h3 className="text-lg font-serif italic text-[#1E2E31]">มู้ดบอร์ดของคุณยังว่างเปล่า</h3>
          <p className="text-xs text-[#5C7276] mt-1 max-w-sm leading-relaxed">
            คลิกที่ปุ่มบุ๊กมาร์กบนเรฟเฟอร์เรตที่คุณชอบในหน้าสำรวจ เพื่อบันทึกเก็บไว้ดูเปรียบเทียบโทนสีได้ทันที
          </p>
          <button
            onClick={onExploreMore}
            className="mt-6 px-5 py-2.5 rounded-full bg-[#3A6360] text-white hover:bg-[#1E2E31] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            ✦ ไปสำรวจคลังเรฟดีไซน์
          </button>
        </div>
      )}
    </main>
  );
};
