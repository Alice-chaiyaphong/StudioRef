import React, { useState } from 'react';
import { ReferenceDesign, ColorPalette } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';
import { User } from 'firebase/auth';
import { Globe, Plus, Palette, Compass, LogIn, Heart } from 'lucide-react';

interface SharedItemsViewProps {
  sharedDesigns: ReferenceDesign[]; // User's own shared designs
  sharedPalettes: ColorPalette[]; // User's own shared palettes
  allDesigns: ReferenceDesign[]; // All community shared designs
  allPalettes: ColorPalette[]; // All community shared palettes
  user: User | null;
  onSignIn: () => void;
  onSelectReference: (design: ReferenceDesign) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onOpenAddModal: () => void;
}

export const SharedItemsView: React.FC<SharedItemsViewProps> = ({
  sharedDesigns,
  sharedPalettes,
  allDesigns,
  allPalettes,
  user,
  onSignIn,
  onSelectReference,
  onToggleBookmark,
  onOpenAddModal
}) => {
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [subTab, setSubTab] = useState<'design' | 'palette'>('design');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Determine which list to render based on the scope and subTab
  const activeDesigns = scope === 'all' ? allDesigns : sharedDesigns;
  const activePalettes = scope === 'all' ? allPalettes : sharedPalettes;
  const hasItems = subTab === 'design' ? activeDesigns.length > 0 : activePalettes.length > 0;

  return (
    <main className="flex-1 flex flex-col p-3 sm:p-5 md:p-6 overflow-y-auto bg-[#F4F7F6]">
      <header className="mb-4">
        <span className="text-[9px] uppercase tracking-widest font-bold text-[#7A938E]">Community & Personal Showcase</span>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-[#1E2E31] mt-0.5 flex items-center gap-2.5">
          <span>ผลงานที่พวกเราแชร์ร่วมกัน</span>
          <span className="text-[10px] sm:text-xs font-sans not-italic bg-[#D1DDD9] text-[#3A6360] px-2.5 py-0.5 rounded-full font-bold">
            {allDesigns.length + allPalettes.length} ไอเทมในระบบ
          </span>
        </h1>
        <p className="text-xs sm:text-xs lg:text-sm text-[#5C7276] mt-1 max-w-xl">
          รวบรวมผลงานการออกแบบและคู่สีธรรมชาติโทนเย็นร่วมกันในชุมชน StudioRef สามารถเลือกดูรายละเอียดเพื่อหาไอเดียได้ทันที
        </p>
      </header>

      {/* Primary Scope Toggle: All Community vs My Shared */}
      <div className="flex gap-2 mb-4 border-b border-[#D1DDD9]/60 pb-3 shrink-0">
        <button
          onClick={() => setScope('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            scope === 'all'
              ? 'bg-[#1E2E31] text-white shadow-xs'
              : 'bg-[#DDE5E4]/60 text-[#5C7276] hover:bg-[#DDE5E4] hover:text-[#1E2E31]'
          }`}
        >
          🌐 ผลงานทั้งหมดในชุมชน ({allDesigns.length + allPalettes.length})
        </button>
        <button
          onClick={() => {
            if (!user) {
              onSignIn();
            } else {
              setScope('mine');
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            scope === 'mine'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'bg-[#DDE5E4]/60 text-[#5C7276] hover:bg-[#DDE5E4] hover:text-[#1E2E31]'
          }`}
        >
          👤 ผลงานที่ฉันแชร์ ({user ? sharedDesigns.length + sharedPalettes.length : 'เข้าสู่ระบบ'})
        </button>
      </div>

      {/* Sub-tab Switcher: Designs vs Palettes */}
      <div className="flex bg-[#DDE5E4]/60 p-0.5 rounded-lg mb-4 w-fit border border-[#D1DDD9]/30 shrink-0">
        <button
          onClick={() => setSubTab('design')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            subTab === 'design'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>ผลงานดีไซน์ ({activeDesigns.length})</span>
        </button>
        <button
          onClick={() => setSubTab('palette')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
            subTab === 'palette'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>พาเลทสี ({activePalettes.length})</span>
        </button>
      </div>

      {hasItems ? (
        subTab === 'design' ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
            {activeDesigns.map((item, idx) => (
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
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
            {activePalettes.map((pal) => (
              <div key={pal.id} className="bg-white rounded-[28px] p-5 sm:p-8 border border-[#D1DDD9] shadow-2xs flex flex-col justify-between hover:border-[#B8CAC4] transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#3A6360] bg-[#EBF1F0] px-3 py-1 rounded-full border border-[#D1DDD9]">
                        {pal.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] mt-3">{pal.title}</h3>
                    </div>
                    <span className="text-xs text-[#7A938E] font-semibold flex items-center gap-1 shrink-0">
                      ❤️ {pal.likes}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C7276] leading-relaxed mb-6">{pal.description}</p>
                </div>

                {/* Colors Showcase Bar */}
                <div className="space-y-4">
                  <div className="h-16 sm:h-20 rounded-xl overflow-hidden flex shadow-inner border border-black/5">
                    {pal.colors.map((c, i) => (
                      <div 
                        key={i} 
                        style={{ backgroundColor: c.hex, width: '20%' }}
                        className="h-full relative group transition-all duration-300 flex items-center justify-center cursor-pointer hover:opacity-90"
                        onClick={() => handleCopy(c.hex)}
                        title={`คลิกคัดลอก ${c.hex} (${c.name})`}
                      >
                        <span className="text-[9px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                          {c.hex}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Color Details List */}
                  <div className="grid grid-cols-5 gap-1 pt-2 border-t border-[#D1DDD9]">
                    {pal.colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleCopy(c.hex)}
                        className="text-center group p-1.5 rounded-xl hover:bg-[#EBF1F0] transition-colors relative cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block border border-black/10 shrink-0" style={{ backgroundColor: c.hex }}></span>
                          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#1E2E31]">{c.hex}</span>
                        </div>
                        <span className="text-[8px] text-[#7A938E] block mt-0.5 truncate uppercase">{c.name}</span>
                        {copiedHex === c.hex && (
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3A6360] text-white text-[9px] px-2 py-0.5 rounded shadow animate-in fade-in z-20 whitespace-nowrap">
                            คัดลอกแล้ว!
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creator Credit for Palettes */}
                {pal.userName && (
                  <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="text-[9px] text-[#5C7276]">
                      ดีไซเนอร์: <span className="font-bold text-[#1E2E31]">{pal.userName}</span>
                    </span>
                    <span className="text-[8px] bg-[#3A6360]/10 text-[#3A6360] px-2 py-0.5 rounded-full font-bold">
                      พาเลทชุมชน
                    </span>
                  </div>
                )}
              </div>
            ))}
          </section>
        )
      ) : (
        <div className="py-16 bg-[#EBF1F0] rounded-[28px] border border-dashed border-[#B8CAC4] flex flex-col items-center justify-center text-center p-6 sm:p-8">
          <div className="w-14 h-14 rounded-full bg-[#D1DDD9] flex items-center justify-center text-[#3A6360] mb-4 shadow-inner">
            {subTab === 'design' ? <Compass className="w-6 h-6 stroke-1.5" /> : <Palette className="w-6 h-6 stroke-1.5" />}
          </div>
          <h3 className="text-lg font-serif italic text-[#1E2E31]">
            {scope === 'mine' ? `คุณยังไม่ได้แชร์${subTab === 'design' ? 'ผลงานดีไซน์' : 'พาเลทสี'}เลย` : `ยังไม่มี${subTab === 'design' ? 'ผลงานดีไซน์' : 'พาเลทสี'}ในระบบ`}
          </h3>
          <p className="text-xs text-[#5C7276] mt-1 max-w-sm leading-relaxed">
            มาร่วมแชร์ไอเดียและสร้างแรงบันดาลใจด้วยสไตล์มินิมอลโมเดิร์นโทนเย็นกับเพื่อนๆ ดีไซเนอร์กันเถอะ!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-6 px-5 py-2.5 rounded-full bg-[#3A6360] text-white hover:bg-[#1E2E31] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เริ่มแชร์{subTab === 'design' ? 'ผลงานดีไซน์' : 'พาเลทสี'}แรก ✦</span>
          </button>
        </div>
      )}
    </main>
  );
};

