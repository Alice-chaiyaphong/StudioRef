import React, { useState } from 'react';
import { ReferenceDesign, ColorPalette } from '../types.ts';
import { ReferenceCard } from './ReferenceCard.tsx';
import { User } from 'firebase/auth';
import { Globe, Plus, Palette, Compass, LogIn, Heart, Database, Sparkles, AlertTriangle, Pencil } from 'lucide-react';

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
  onSeedFirestore?: () => Promise<void>;
  seeding?: boolean;
  firestoreError?: string | null;
  onEditItem?: (item: any) => void;
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
  onOpenAddModal,
  onSeedFirestore,
  seeding = false,
  firestoreError = null,
  onEditItem
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
      {firestoreError && (
        <div className="mb-5 bg-amber-50/90 border border-amber-200 rounded-[20px] p-4 flex gap-3 text-[#1E2E31] text-xs shadow-xs animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <p className="font-bold text-amber-800">ระบบทำงานในโหมดออฟไลน์/บันทึกในเครื่องชั่วคราว (Local Storage Mode) ⚠️</p>
            <p className="text-amber-700 leading-normal">
              หน้าเว็บไม่สามารถรับส่งข้อมูลเรียลไทม์กับระบบ Cloud Firestore ของคุณได้ เนื่องจากเกิดข้อขัดข้อง: <code className="bg-amber-100/90 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold text-[11px] select-all">{firestoreError}</code>
            </p>
            <p className="text-[#5C7276] text-[11px] leading-relaxed pt-1">
              แอปพลิเคชันจะยังบันทึกข้อมูลของคุณไว้ในเบราว์เซอร์นี้อย่างปลอดภัย และจะอัปโหลดขึ้นคลาวด์โดยอัตโนมัติเมื่อได้รับการกู้คืนการเชื่อมต่อหรือจัดเตรียมฐานข้อมูลสิทธิ์เรียบร้อยแล้ว
            </p>
          </div>
        </div>
      )}

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
                user={user}
                onEdit={onEditItem}
              />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
            {activePalettes.map((pal) => {
              const isOwner = user && (pal.userId === user.uid || pal.id.startsWith('local_'));
              return (
                <div key={pal.id} className="bg-white rounded-[28px] p-5 sm:p-8 border border-[#D1DDD9] shadow-2xs flex flex-col justify-between hover:border-[#B8CAC4] transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#3A6360] bg-[#EBF1F0] px-3 py-1 rounded-full border border-[#D1DDD9]">
                          {pal.category}
                        </span>
                        {((pal as any).price !== undefined || (pal as any).priceCondition) && (
                          <span className={`text-[9px] sm:text-[10px] tracking-wide font-bold ml-2 px-2.5 py-1 rounded-full border shadow-2xs ${
                            (pal as any).priceCondition === 'free' || !(pal as any).priceCondition
                              ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20'
                              : 'bg-[#B86B52]/10 text-[#B86B52] border-[#B86B52]/20'
                          }`}>
                            {(pal as any).priceCondition === 'free' ? 'FREE' : (pal as any).priceCondition === 'premium' ? 'PREMIUM' : `${(pal as any).price} ฿`}
                          </span>
                        )}
                        <h3 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] mt-3">{pal.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && onEditItem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditItem(pal);
                            }}
                            className="p-1.5 rounded-full bg-[#EBF1F0] text-[#3A6360] hover:bg-[#1E2E31] hover:text-white transition-all cursor-pointer shadow-2xs"
                            title="แก้ไขพาเลทสี"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <span className="text-xs text-[#7A938E] font-semibold flex items-center gap-1">
                          ❤️ {pal.likes}
                        </span>
                      </div>
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
              );
            })}
          </section>
        )
      ) : (
        allDesigns.length === 0 && allPalettes.length === 0 && scope === 'all' ? (
          <div className="py-16 bg-[#EBF1F0] rounded-[28px] border border-dashed border-[#B8CAC4] flex flex-col items-center justify-center text-center p-6 sm:p-8">
            <div className="w-14 h-14 rounded-full bg-[#D1DDD9] flex items-center justify-center text-[#3A6360] mb-4 shadow-inner animate-pulse">
              <Database className="w-6 h-6 stroke-1.5" />
            </div>
            <h3 className="text-lg font-serif italic text-[#1E2E31] font-bold">
              คลาวด์ Firestore ยังไม่มีข้อมูลสะสมเลย ☁️
            </h3>
            <p className="text-xs text-[#5C7276] mt-2 max-w-md leading-relaxed">
              ฐานข้อมูลคลาวด์ Firestore ของคุณพึ่งได้รับการเชื่อมต่อหรือกำลังทำงานอยู่ แต่ยังไม่มีข้อมูลสะสมในคอลเลกชัน <code className="bg-[#D1DDD9] text-[#1E2E31] px-1.5 py-0.5 rounded font-mono font-bold">"My Desing"</code>
            </p>
            
            {user ? (
              <div className="mt-6 p-4 bg-white/80 border border-[#D1DDD9] rounded-2xl max-w-md shadow-xs">
                <p className="text-xs text-[#1E2E31] font-bold">เชื่อมต่อคลาวด์สำเร็จแล้ว!</p>
                <p className="text-[11px] text-[#5C7276] mt-1 mb-4 leading-normal">
                  เพื่อเริ่มทดสอบระบบ คุณสามารถกดปุ่มนำเข้าข้อมูลจำลองด้านล่างนี้ ระบบจะเขียนดีไซน์และพาเลทสีเริ่มต้นจำนวน 4 รายการขึ้นสู่ Cloud Firestore โดยตรงเพื่อให้คุณและผู้ใช้อื่นๆ เห็นผลงานร่วมกันได้
                </p>
                <button
                  onClick={onSeedFirestore}
                  disabled={seeding}
                  className="w-full justify-center px-5 py-2.5 rounded-xl bg-[#3A6360] text-white hover:bg-[#1E2E31] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {seeding ? (
                    <>
                      <Database className="w-4 h-4 animate-spin" />
                      <span>กำลังนำเข้าข้อมูลตัวอย่าง...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                      <span>⚡ นำเข้าข้อมูลเริ่มต้นลงคลาวด์ (Seed to Firestore)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-white/80 border border-[#D1DDD9] rounded-2xl max-w-md shadow-xs">
                <p className="text-xs text-[#1E2E31] font-bold">กรุณาเข้าสู่ระบบก่อนเพื่อทำรายการ</p>
                <p className="text-[11px] text-[#5C7276] mt-1 mb-4 leading-normal">
                  ระบบรักษาความปลอดภัยของ Firestore กำหนดให้เฉพาะผู้ใช้ที่ลงทะเบียนผ่าน Google เท่านั้นที่สามารถเขียนข้อมูลได้
                </p>
                <button
                  onClick={onSignIn}
                  className="w-full justify-center px-5 py-2.5 rounded-xl bg-[#1E2E31] text-white hover:bg-[#3A6360] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบผ่าน Google เพื่อเขียนข้อมูล</span>
                </button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#D1DDD9]/60 w-full max-w-md flex flex-col items-center">
              <span className="text-[10px] text-[#7A938E] font-sans block mb-3 uppercase tracking-wider font-bold">หรือเริ่มโพสต์ไอเดียใหม่ด้วยตัวคุณเอง:</span>
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 rounded-full bg-white border border-[#3A6360] text-[#3A6360] hover:bg-[#3A6360]/5 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>แชร์โพสต์ใหม่ของคุณ</span>
              </button>
            </div>
          </div>
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
        )
      )}
    </main>
  );
};

