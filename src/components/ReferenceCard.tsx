import React from 'react';
import { ReferenceDesign } from '../types.ts';
import { Bookmark, Heart, Sparkles } from 'lucide-react';

interface ReferenceCardProps {
  design: ReferenceDesign;
  onSelect: (design: ReferenceDesign) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  index: number;
}

const CARD_BACKGROUNDS = [
  'bg-[#E1EBE8]',
  'bg-[#E5ECEC]',
  'bg-[#DDE5E4]',
  'bg-[#E8EFF1]'
];

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  design,
  onSelect,
  onToggleBookmark,
  index
}) => {
  const bgClass = CARD_BACKGROUNDS[index % CARD_BACKGROUNDS.length];

  return (
    <div 
      onClick={() => onSelect(design)}
      className={`${bgClass} rounded-[28px] p-4 flex flex-col justify-between overflow-hidden relative group cursor-pointer border border-black/5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
    >
      {/* Hover natural overlay tint */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#3A6360] opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>

      {/* Preview Image Frame - NOW AT THE TOP OF THE CARD */}
      <div className="w-full aspect-[4/3] bg-[#CBDAD5] rounded-2xl border border-black/5 shadow-inner overflow-hidden relative z-10 mb-3.5">
        <img 
          src={design.imageUrl} 
          alt={design.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Card Header overlay on top of image */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex justify-between items-center">
          <span className="text-[9px] bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full uppercase tracking-widest font-bold text-[#3A6360] shadow-sm">
            {design.category}
          </span>

          <button
            onClick={(e) => onToggleBookmark(design.id, e)}
            className={`p-1.5 rounded-full transition-colors duration-200 shadow-sm ${
              design.bookmarked 
                ? 'bg-[#3A6360] text-white' 
                : 'bg-white/90 text-[#5C7276] hover:bg-white text-[#2C3E42]'
            }`}
            title={design.bookmarked ? 'นำออกจากมู้ดบอร์ด' : 'บันทึกลงมู้ดบอร์ด'}
          >
            <Bookmark className="w-3 h-3 fill-current" />
          </button>
        </div>
        
        {/* Color Palette Chips overlay at bottom */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl flex items-center justify-between shadow-xs opacity-95 group-hover:opacity-100 transition-opacity">
          <div className="flex -space-x-1 pl-1">
            {design.palette.slice(0, 5).map((color, idx) => (
              <span 
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs inline-block"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#3A6360] font-mono pr-1.5 font-bold flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 fill-[#EADDED] text-[#B86B52]" /> {design.likes}
          </span>
        </div>
      </div>

      {/* Card Title, Vibe & Description below the image */}
      <div className="z-10 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-serif italic text-[#1E2E31] leading-snug group-hover:text-[#3A6360] transition-colors font-medium">
            {design.title}
          </h3>
          <p className="text-[11px] text-[#5C7276] font-semibold mt-0.5">
            {design.subtitle}
          </p>
          <p className="text-xs opacity-85 mt-1.5 line-clamp-2 text-[#2C3E42] leading-relaxed">
            {design.description}
          </p>
        </div>

        {/* Creator Info (if community design) */}
        {(design as any).userName && (
          <div className="mt-3.5 pt-2 border-t border-black/5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {((design as any).userPhoto) ? (
                <img 
                  src={(design as any).userPhoto} 
                  alt={(design as any).userName} 
                  className="w-4.5 h-4.5 rounded-full object-cover border border-[#B8CAC4] shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-4.5 h-4.5 rounded-full bg-[#3A6360] text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                  {(design as any).userName.charAt(0)}
                </div>
              )}
              <span className="text-[9px] text-[#5C7276] truncate">
                แชร์โดย <span className="font-bold text-[#1E2E31]">{(design as any).userName}</span>
              </span>
            </div>
            <span className="text-[8px] bg-[#3A6360]/10 text-[#3A6360] px-2 py-0.5 rounded-full font-bold shrink-0">
              ชุมชน
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
