import React, { useState } from 'react';
import { ReferenceDesign } from '../types.ts';
import { X, Copy, Check, Bookmark, Share2, ExternalLink, Type, Layout, Palette } from 'lucide-react';

interface ReferenceDetailModalProps {
  design: ReferenceDesign | null;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
}

export const ReferenceDetailModal: React.FC<ReferenceDetailModalProps> = ({
  design,
  onClose,
  onToggleBookmark
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!design) return null;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#D1DDD9] shadow-2xl flex flex-col md:flex-row relative pb-6 md:pb-0 scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 bg-[#DDE5E4] hover:bg-[#D1DDD9] text-[#1E2E31] rounded-full transition-colors cursor-pointer shadow-2xs"
          aria-label="Close"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Left Aspect Image Showcase */}
        <div className="md:w-1/2 p-5 sm:p-6 md:p-8 bg-[#EBF1F0] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D1DDD9]">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-[#D1DDD9] text-[#3A6360] rounded-full inline-block mb-4">
              {design.category} Reference
            </span>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xs border border-black/5 bg-[#CBDAD5]">
              <img 
                src={design.imageUrl} 
                alt={design.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-5 border-t border-[#D1DDD9]">
            <button
              onClick={() => onToggleBookmark(design.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                design.bookmarked
                  ? 'bg-[#3A6360] text-white shadow-xs'
                  : 'bg-[#D1DDD9] text-[#1E2E31] hover:bg-[#B8CAC4]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{design.bookmarked ? 'บันทึกในมู้ดบอร์ดแล้ว' : 'บันทึกเรฟนี้'}</span>
            </button>

            <span className="text-xs text-[#5C7276] font-semibold">
              ❤️ ถูกใจ {design.likes} ครั้ง
            </span>
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#7A938E]">{design.subtitle}</p>
              <h2 className="text-2xl sm:text-3xl font-serif italic text-[#1E2E31] mt-1 tracking-tight">{design.title}</h2>
              <p className="text-xs sm:text-sm text-[#5C7276] mt-3 leading-relaxed">{design.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {design.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] bg-[#DDE5E4] text-[#3A6360] px-3 py-1 rounded-full font-bold">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Color Palette Studio */}
            <div className="bg-[#EBF1F0] p-4 rounded-xl border border-[#D1DDD9]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#3A6360]" /> โทนสีหลัก (คลิกเพื่อคัดลอก HEX)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {design.palette.map((hex, idx) => (
                  <button
                    key={idx}
                    onClick={() => copyToClipboard(hex)}
                    className="group relative flex flex-col items-center gap-1 p-0.5 rounded-lg transition-transform active:scale-95 cursor-pointer"
                    title={`คัดลอก ${hex}`}
                  >
                    <div 
                      className="w-full h-9 rounded-md shadow-2xs border border-black/10 flex items-center justify-center transition-all group-hover:ring-2 ring-[#3A6360]"
                      style={{ backgroundColor: hex }}
                    >
                      {copiedHex === hex ? (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md animate-in zoom-in" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/0 group-hover:text-white/80 transition-colors drop-shadow" />
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-[#5C7276] font-bold uppercase">{hex}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Specs */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#3A6360]" /> คำแนะนำ Typography
              </span>
              <div className="bg-[#DDE5E4] p-3.5 rounded-xl grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#7A938E] block text-[9px] uppercase font-bold">Heading (หัวข้อ)</span>
                  <span className="font-serif italic font-bold text-[#1E2E31] text-sm mt-0.5 block">{design.typography.heading}</span>
                </div>
                <div>
                  <span className="text-[#7A938E] block text-[9px] uppercase font-bold">Body (เนื้อหา)</span>
                  <span className="font-sans font-medium text-[#2C3E42] text-xs sm:text-sm mt-0.5 block">{design.typography.body}</span>
                </div>
              </div>
              <p className="text-xs text-[#5C7276] italic bg-[#EBF1F0] px-3 py-2 rounded-lg border-l-2 border-[#3A6360]">
                💡 มู้ด: {design.typography.vibe}
              </p>
            </div>

            {/* Layout Keynotes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-[#3A6360]" /> เทคนิคดีไซน์เลย์เอาต์
              </span>
              <ul className="space-y-1.5 text-xs text-[#5C7276]">
                {design.layoutNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#3A6360] font-bold">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
