import React from 'react';
import { Compass, Sparkles, Palette, Bookmark, Menu } from 'lucide-react';

interface SidebarProps {
  activeTab: 'explore' | 'palettes' | 'ai' | 'saved';
  setActiveTab: (tab: 'explore' | 'palettes' | 'ai' | 'saved') => void;
  savedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, savedCount }) => {
  return (
    <>
      {/* MOBILE TOP BAR (Only visible on mobile/tablet < md) */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 border-b border-[#D1DDD9] bg-[#EBF1F0] sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-8 h-8 bg-[#3A6360] rounded-full flex items-center justify-center shadow-xs">
            <div className="w-4 h-4 border-2 border-white rounded-xs rotate-45"></div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-[#1E2E31] block">StudioRef</span>
            <span className="text-[9px] text-[#7A938E] uppercase tracking-widest block font-medium">Design AI Space</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#3A6360]/10 text-[#3A6360] px-2.5 py-1 rounded-full font-bold">
            Pro Member
          </span>
          <div className="w-8 h-8 rounded-full bg-[#D1DDD9] border border-[#B8CAC4] overflow-hidden flex items-center justify-center font-serif text-[#3A6360] font-bold text-sm">
            DP
          </div>
        </div>
      </header>

      {/* DESKTOP SIDEBAR (Only visible on screens >= md) */}
      <aside className="hidden md:flex w-64 border-r border-[#D1DDD9] bg-[#EBF1F0] flex-col p-8 select-none shrink-0" style={{ backgroundColor: '#EBF1F0' }}>
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 bg-[#3A6360] rounded-full flex items-center justify-center shadow-sm">
            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-[#1E2E31] block">StudioRef</span>
            <span className="text-[10px] text-[#7A938E] uppercase tracking-widest block font-medium">Design AI Space</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#7A938E] font-bold px-2 mb-2">สำรวจ</p>
            
            <div 
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                activeTab === 'explore' 
                  ? 'bg-[#3A6360] text-white shadow-sm font-medium' 
                  : 'text-[#5C7276] hover:bg-[#D1DDD9] hover:text-[#1E2E31]'
              }`}
            >
              <Compass className="w-4 h-4 opacity-80" />
              <span className="text-sm">หน้าแรก & ค้นหา</span>
            </div>

            <div 
              onClick={() => setActiveTab('saved')}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                activeTab === 'saved' 
                  ? 'bg-[#3A6360] text-white shadow-sm font-medium' 
                  : 'text-[#5C7276] hover:bg-[#D1DDD9] hover:text-[#1E2E31]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 opacity-80" />
                <span className="text-sm">มู้ดบอร์ดที่บันทึก</span>
              </div>
              {savedCount > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-[#D1DDD9] text-[#3A6360]'
                }`}>
                  {savedCount}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#7A938E] font-bold px-2 mb-2">เครื่องมือ</p>
            
            <div 
              onClick={() => setActiveTab('palettes')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                activeTab === 'palettes' 
                  ? 'bg-[#3A6360] text-white shadow-sm font-medium' 
                  : 'text-[#5C7276] hover:bg-[#D1DDD9] hover:text-[#1E2E31]'
              }`}
            >
              <Palette className="w-4 h-4 opacity-80" />
              <span className="text-sm">พาเลทสีโทนเย็น</span>
            </div>

            <div 
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                activeTab === 'ai' 
                  ? 'bg-[#3A6360] text-white shadow-sm font-medium' 
                  : 'text-[#5C7276] hover:bg-[#D1DDD9] hover:text-[#1E2E31]'
              }`}
            >
              <Sparkles className="w-4 h-4 opacity-80 text-[#2E8B90]" />
              <span className="text-sm">ผู้ช่วยปรึกษา AI</span>
            </div>
          </div>
        </nav>

        {/* User Profile Footer */}
        <div className="pt-6 border-t border-[#D1DDD9]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#D1DDD9]/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#D1DDD9] border border-[#B8CAC4] overflow-hidden flex items-center justify-center font-serif text-[#3A6360] font-bold text-lg bg-gradient-to-br from-[#D1DDD9] to-[#B8CAC4]">
              DP
            </div>
            <div>
              <p className="text-sm font-bold text-[#1E2E31]">Designer P.</p>
              <p className="text-[11px] text-[#7A938E] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3A6360]"></span> Pro Member
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE FLOATING BOTTOM NAV BAR */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#D1DDD9] justify-around items-center px-4 pb-safe z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'explore' ? 'text-[#3A6360] font-semibold' : 'text-[#5C7276]'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">หน้าแรก</span>
        </button>

        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
            activeTab === 'saved' ? 'text-[#3A6360] font-semibold' : 'text-[#5C7276]'
          }`}
        >
          <Bookmark className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">บันทึกไว้</span>
          {savedCount > 0 && (
            <span className="absolute top-1 right-6 bg-[#3A6360] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
              {savedCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('palettes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'palettes' ? 'text-[#3A6360] font-semibold' : 'text-[#5C7276]'
          }`}
        >
          <Palette className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">พาเลทสี</span>
        </button>

        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'ai' ? 'text-[#3A6360] font-semibold' : 'text-[#5C7276]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-[#2E8B90]" />
          <span className="text-[10px]">ผู้ช่วย AI</span>
        </button>
      </nav>
    </>
  );
};
