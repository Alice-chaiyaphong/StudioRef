import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AIAssistantConsultation, ColorPalette } from '../types.ts';
import { Sparkles, Send, Bot, User, Copy, Check, Palette, Type, Layout, RefreshCw, Compass } from 'lucide-react';

interface AIAssistantViewProps {
  initialPrompt?: string;
  onApplyPalette?: (pal: any) => void;
}

const SAMPLE_PROMPTS = [
  "ออกแบบคู่สีแนวโมเดิร์นคูลโทนสำหรับบรรจุภัณฑ์ (Packaging) ครีมบำรุงผิวสกัดจากธารน้ำแข็ง",
  "แนะนำ Typography และเลย์เอาต์มินิมอลโปร่งตาสำหรับแอปเพื่อสุขภาพ (UI/UX & Web)",
  "ขอพาเลทสีเย็นและการจัดแสงเงาสำหรับเก้าอี้ทำงานอลูมิเนียมขัดเงา (Product Design)",
  "ขอคอนเซปต์สื่อโมชั่นอาร์ต (Digital Media) สีแนว Cyber Glacier ผสมผสานสไตล์ไซไฟ",
  "ไอเดียจัดโปสเตอร์นิทรรศการศิลปะแบบตัวอักษรดิสเพลย์ (Graphic Design) และเว้นพื้นที่ว่างเก๋ๆ"
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ initialPrompt, onApplyPalette }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'สวัสดีค่ะ! ดิฉัน StudioRef AI Senior Design Consultant ยินดีต้อนรับนักออกแบบทุกสายงาน ทั้งกราฟิก, สื่อดิจิทัล, ผลิตภัณฑ์, เว็บ/แอป, บรรจุภัณฑ์ และตกแต่งภายใน/สถาปัตยกรรม 💻🎨📦 พร้อมวิเคราะห์โจทย์แนะนำคู่สีโทนเย็นสุดพรีเมียม ฟอนต์ และแนวทางการจัดวางเลย์เอาต์เฉพาะตัว พิมพ์คุยได้เลยค่ะ ❄️',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });
      const data = await res.json();

      if (data.success && data.consultation) {
        const consult: AIAssistantConsultation = data.consultation;
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: consult.vibeSummary || "ดิฉันได้วิเคราะห์ทิศทางและเตรียมคำแนะนำสไตล์งานให้เรียบร้อยแล้วค่ะ",
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          aiConsultation: consult
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('ไม่สามารถรับข้อมูลจาก AI');
      }
    } catch (err) {
      console.error(err);
      const errRef: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'ขออภัยค่ะ ระบบการเชื่อมต่อ AI ขัดข้องชั่วคราว แต่ดิฉันขอแนะนำสูตรเซฟตี้สำหรับงานสไตล์โมเดิร์นโทนเย็นคือ: ใช้โทนสี Ice Mint (#EBF1F0), Cool Grey (#DDE5E4) และ Slate Spruce (#3A6360) คู่กับฟอนต์ Outfit ทรงไร้หัว และเว้น White Space อย่างน้อย 35% ค่ะ ❄️',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errRef]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#F4F7F6] overflow-hidden">
      {/* Top Banner Header */}
      <header className="px-4 sm:px-6 py-3 border-b border-[#D1DDD9] bg-[#EBF1F0] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#3A6360] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#2E8B90]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-serif italic text-[#1E2E31] font-bold">StudioRef AI Consultant</h2>
            <p className="text-[9px] sm:text-xs text-[#7A938E]">ผู้ช่วยดีไซเนอร์ส่วนตัว แนะนำโทนสีเย็นและเลย์เอาต์มินิมอล</p>
          </div>
        </div>
        <span className="text-[9px] uppercase font-mono px-2.5 py-1 bg-[#D1DDD9] text-[#3A6360] rounded-full font-bold hidden sm:inline-block">
          Powered by Gemini 2.5
        </span>
      </header>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 sm:gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#D1DDD9] border border-[#B8CAC4] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-[#3A6360]" />
              </div>
            )}

            <div className={`max-w-3xl ${msg.sender === 'user' ? 'bg-[#3A6360] text-white rounded-t-3xl rounded-bl-3xl p-4 sm:p-5 shadow-xs' : 'space-y-4 w-full'}`}>
              {/* Message text */}
              <div className={msg.sender === 'ai' ? 'bg-[#EBF1F0] border border-[#D1DDD9] rounded-t-3xl rounded-br-3xl p-4 sm:p-6 shadow-2xs text-[#2C3E42]' : 'text-xs sm:text-sm'}>
                <p className="text-sm sm:text-base leading-relaxed">{msg.text}</p>
                <span className={`text-[9px] sm:text-[10px] block mt-2 ${msg.sender === 'user' ? 'text-white/60 text-right' : 'text-[#7A938E]'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {/* Rich AI Consultation Breakdown Card */}
              {msg.aiConsultation && (
                <div className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 border border-[#D1DDD9] shadow-xs space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <div className="border-b border-[#D1DDD9] pb-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-[#7A938E] block">ถอดรหัสโปรเจกต์</span>
                    <h3 className="text-xl sm:text-2xl font-serif italic text-[#1E2E31] mt-1">{msg.aiConsultation.projectConcept}</h3>
                  </div>

                  {/* Recommended Palette Specifications */}
                  {msg.aiConsultation.colorPaletteRecommendation && (
                    <div className="bg-[#EBF1F0] p-4 sm:p-5 rounded-2xl border border-[#D1DDD9]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5 text-[#3A6360]" /> แนะนำพาเลท: {msg.aiConsultation.colorPaletteRecommendation.title}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {msg.aiConsultation.colorPaletteRecommendation.colors.map((c, i) => (
                          <div 
                            key={i}
                            onClick={() => handleCopy(c.hex)}
                            className="bg-white p-2.5 sm:p-3 rounded-xl border border-[#D1DDD9] flex flex-col items-center text-center cursor-pointer hover:border-[#3A6360] transition-all group"
                          >
                            <div className="w-full h-8 rounded-md mb-1.5 shadow-2xs border border-black/5" style={{ backgroundColor: c.hex }}></div>
                            <span className="font-mono text-[11px] sm:text-xs font-bold text-[#1E2E31]">{c.hex}</span>
                            <span className="text-[9px] sm:text-[10px] text-[#7A938E] truncate max-w-full font-medium mt-0.5">{c.name}</span>
                            <span className="text-[8px] bg-[#DDE5E4] text-[#3A6360] px-2 py-0.5 rounded-full mt-1 font-bold">{c.proportion}</span>
                            {copiedHex === c.hex && <span className="text-[8px] text-[#3A6360] font-bold mt-1">คัดลอก!</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typography & Layout grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Typography */}
                    <div className="bg-[#DDE5E4] p-4 sm:p-5 rounded-2xl space-y-2">
                      <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-[#3A6360]" /> แนะนำคู่ฟอนต์ (Typography)
                      </span>
                      <div className="text-xs space-y-1">
                        <p><strong className="text-[#7A938E]">หัวข้อ:</strong> <span className="font-serif italic text-sm text-[#1E2E31] font-bold">{msg.aiConsultation.typographyGuide?.headingFont}</span></p>
                        <p><strong className="text-[#7A938E]">เนื้อหา:</strong> <span className="font-sans text-[#2C3E42] font-medium">{msg.aiConsultation.typographyGuide?.bodyFont}</span></p>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-[#5C7276] italic border-t border-[#B8CAC4] pt-2 mt-2">
                        "{msg.aiConsultation.typographyGuide?.rationale}"
                      </p>
                    </div>

                    {/* Layout Keynotes */}
                    <div className="bg-[#EBF1F0] p-4 sm:p-5 rounded-2xl border border-[#D1DDD9] space-y-2">
                      <span className="text-xs font-bold text-[#1E2E31] flex items-center gap-1.5">
                        <Layout className="w-3.5 h-3.5 text-[#3A6360]" /> กฎเหล็กการจัดเลย์เอาต์
                      </span>
                      <ul className="text-xs text-[#5C7276] space-y-1.5 list-disc pl-4">
                        {msg.aiConsultation.layoutBestPractices?.map((l: string, idx: number) => (
                          <li key={idx}>{l}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reference Inspirations */}
                  <div>
                    <span className="text-xs font-bold text-[#1E2E31] block mb-3.5">💡 ทิศทางสไตล์เรฟเฟอร์เรตที่น่าสนใจ</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.aiConsultation.referenceInspirations?.map((refItem: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-[#F4F7F6] border border-[#D1DDD9] text-xs">
                          <h4 className="font-serif italic font-bold text-[#3A6360] text-sm">{refItem.title}</h4>
                          <p className="text-[#5C7276] mt-1 text-[11px] sm:text-xs leading-relaxed">{refItem.desc}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-[#D1DDD9] text-[#1E2E31] rounded-md text-[9px] sm:text-[10px] font-semibold">
                            ★ {refItem.aspect}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#1E2E31] text-white flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 sm:gap-4 justify-start items-center">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-[#D1DDD9] flex items-center justify-center animate-pulse">
              <Bot className="w-4.5 sm:w-5 h-4.5 sm:h-5 text-[#3A6360]" />
            </div>
            <div className="bg-[#EBF1F0] border border-[#D1DDD9] rounded-2xl px-4 py-2.5 text-xs text-[#5C7276] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3A6360]" />
              <span>StudioRef AI กำลังค้นคว้าเรฟเฟอร์เรตและคำนวณโทนสีเย็น...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 sm:px-8 pt-2.5 pb-2 bg-[#F4F7F6] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none border-t border-[#D1DDD9]/50 -mx-4 px-4 sm:mx-0 sm:px-8">
        <span className="text-[9px] sm:text-[10px] font-bold text-[#7A938E] uppercase shrink-0">ไอเดียดีไซน์:</span>
        {SAMPLE_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendPrompt(p)}
            disabled={loading}
            className="text-[11px] bg-[#DDE5E4] hover:bg-[#D1DDD9] text-[#3A6360] px-3 py-1 rounded-full whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer font-bold"
          >
            ✦ {p}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-4 sm:p-5 bg-[#EBF1F0] border-t border-[#D1DDD9] shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendPrompt(input); }}
          className="max-w-4xl mx-auto relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์ถามผู้ช่วย AI เช่น จัดวาง UI สำหรับเว็บบนโทรศัพท์อย่างไรดี..."
            className="w-full bg-white border border-[#B8CAC4] rounded-full pl-5 pr-12 py-3 text-xs sm:text-sm focus:ring-2 ring-[#3A6360] outline-none text-[#1E2E31] placeholder-[#7A938E] shadow-2xs"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-full bg-[#3A6360] hover:bg-[#1E2E31] disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </main>
  );
};
