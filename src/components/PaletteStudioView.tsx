import React, { useState } from 'react';
import { ColorPalette } from '../types.ts';
import { Sparkles, Copy, Check, RefreshCw, Palette, Heart, Share2, Plus, Globe } from 'lucide-react';

interface PaletteStudioViewProps {
  palettes: ColorPalette[];
  communityPalettes: ColorPalette[];
  onAddPalette: (pal: ColorPalette) => void;
  onOpenAddModal: () => void;
}

export const PaletteStudioView: React.FC<PaletteStudioViewProps> = ({
  palettes,
  communityPalettes,
  onAddPalette,
  onOpenAddModal
}) => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<'curated' | 'community'>('curated');

  const activePalettes = sourceTab === 'curated' ? palettes : communityPalettes;

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const generateAIPalette = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
      });
      const data = await res.json();
      if (data.success && data.palette) {
        onAddPalette(data.palette);
        setKeyword('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-4 sm:p-8 md:p-10 overflow-y-auto bg-[#F4F7F6]">
      {/* View Header */}
      <header className="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#7A938E]">Natural Palette Studio</span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-[#1E2E31] mt-1">
            พาเลทสีสไตล์ธรรมชาติโทนเย็น & มินิมอล
          </h1>
          <p className="text-xs sm:text-sm text-[#5C7276] mt-2 max-w-2xl">
            คัดสรรคู่สีจากธรรมชาติและธาตุเย็นที่เรียบง่าย อัตราส่วน 60:30:10 พร้อมเครื่องมือสร้างพาเลทด้วย AI เพื่อมู้ดที่ผ่อนคลายและสงบ
          </p>
        </div>

        <button 
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-[#1E2E31] text-white hover:bg-black text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#B8CAC4]" />
          <span>แชร์พาเลทสีใหม่</span>
        </button>
      </header>

      {/* Source Collection Switcher */}
      <div className="flex bg-[#DDE5E4]/60 p-1 rounded-xl mb-6 w-fit border border-[#D1DDD9]/30 shrink-0">
        <button
          onClick={() => setSourceTab('curated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
            sourceTab === 'curated'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>แนะนำโดยสตูดิโอ ({palettes.length})</span>
        </button>
        <button
          onClick={() => setSourceTab('community')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
            sourceTab === 'community'
              ? 'bg-[#3A6360] text-white shadow-xs'
              : 'text-[#5C7276] hover:text-[#1E2E31]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>พาเลทสีจากชุมชน ({communityPalettes.length})</span>
        </button>
      </div>

      {/* AI Palette Generator Form */}
      <section className="bg-[#EBF1F0] rounded-[28px] p-5 sm:p-6 lg:p-8 border border-[#D1DDD9] mb-8 shadow-2xs">
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[#3A6360] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#2E8B90]" />
              <span>เครื่องมือสร้างพาเลทสีด้วย AI (Gemini Studio)</span>
            </div>
            <p className="text-xs text-[#5C7276] mt-1">
              พิมพ์คำค้นหา เช่น "คาเฟ่ชาเขียวสไตล์เซน", "ป่าดิบชื้นเย็นๆ", "สระน้ำหินธรรมชาติ"
            </p>
          </div>

          <form onSubmit={generateAIPalette} className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="เช่น ธารน้ำแข็งในไอซ์แลนด์สีคราม..." 
              className="bg-[#F4F7F6] border border-[#B8CAC4] rounded-full px-5 py-2.5 sm:py-3 text-xs sm:text-sm w-full sm:w-80 focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="bg-[#3A6360] hover:bg-[#1E2E31] disabled:opacity-50 text-white rounded-full px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shrink-0 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#2E8B90]" />}
              <span>{loading ? 'กำลังวิเคราะห์...' : 'สร้างพาเลท AI'}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Curated Palettes Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pb-10">
        {activePalettes.length > 0 ? (
          activePalettes.map((pal) => (
            <div key={pal.id} className="bg-white rounded-[28px] p-5 sm:p-8 border border-[#D1DDD9] shadow-2xs flex flex-col justify-between hover:border-[#B8CAC4] transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#3A6360] bg-[#EBF1F0] px-3 py-1 rounded-full border border-[#D1DDD9]">
                      {pal.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] mt-3">{pal.title}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs text-[#7A938E] font-semibold flex items-center gap-1">
                      ❤️ {pal.likes}
                    </span>
                    {(pal as any).userName && (
                      <span className="text-[9px] text-[#7A938E] font-medium">
                        โดย {(pal as any).userName}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#5C7276] leading-relaxed mb-6">{pal.description}</p>
              </div>

              {/* Colors Showcase Bar */}
              <div className="space-y-4">
                <div className="h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex shadow-inner border border-black/5">
                  {pal.colors.map((c, i) => (
                    <div 
                      key={i} 
                      style={{ backgroundColor: c.hex, width: `${c.percentage || 20}%` }}
                      className="h-full relative group transition-all duration-300 flex items-center justify-center cursor-pointer hover:opacity-90"
                      onClick={() => handleCopy(c.hex)}
                      title={`คลิกคัดลอก ${c.hex} (${c.name})`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-black/60 text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Color Details List */}
                <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-[#D1DDD9]">
                  {pal.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(c.hex)}
                      className="text-center group p-1 sm:p-2 rounded-lg sm:rounded-xl hover:bg-[#EBF1F0] transition-colors relative"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
                        <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full inline-block border border-black/10 shrink-0" style={{ backgroundColor: c.hex }}></span>
                        <span className="text-[9px] sm:text-[11px] font-mono font-bold text-[#1E2E31]">{c.hex}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-[#7A938E] block mt-0.5 truncate uppercase">{c.name}</span>
                      {copiedHex === c.hex && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3A6360] text-white text-[9px] px-2 py-0.5 rounded shadow animate-in fade-in z-20 whitespace-nowrap">
                          คัดลอกแล้ว!
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-[#EBF1F0] rounded-[28px] border border-dashed border-[#B8CAC4] p-8">
            <Palette className="w-12 h-12 text-[#7A938E] mb-3 stroke-1" />
            <h4 className="text-lg font-serif italic text-[#3A6360]">ยังไม่มีพาเลทสีจากชุมชน</h4>
            <p className="text-xs text-[#5C7276] mt-1 max-w-sm">ร่วมเป็นคนแรกที่สร้างและแชร์พาเลทสีโทนเย็นมินิมอลของคุณให้ทุกคนได้ใช้งาน!</p>
            <button
              onClick={onOpenAddModal}
              className="mt-5 px-6 py-2.5 bg-[#3A6360] text-white text-xs font-bold rounded-xl hover:bg-[#1E2E31] transition-colors flex items-center gap-2 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>แชร์พาเลทสีแรกเลย ✨</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
};
