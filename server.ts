import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // AI Assistant endpoint: Analyzes project concept and recommends reference styling
  app.post('/api/ai-consult', async (req, res) => {
    try {
      const { prompt, currentVibe } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'กรุณาระบุแนวคิดหรือโปรเจกต์ที่ต้องการ' });
      }

      const ai = getAIClient();
      const systemInstruction = `คุณคือ StudioRef AI Senior Design Consultant พิถีพิถันด้าน Minimal & Natural Aesthetics
ให้คำแนะนำนักออกแบบภาษาไทยด้วยน้ำเสียงอบอุ่น สุขุม มืออาชีพ
วิเคราะห์โจทย์ข้อความของลูกค้า แล้วให้คำแนะนำสไตล์งาน โทนสี (พร้อมรหัส HEX 4-5 สี) ฟอนต์ และไอเดียการจัดวาง
ตอบกลับเป็นรูปแบบ JSON โครงสร้างนี้เท่านั้น:
{
  "projectConcept": "สรุปสั้นๆ ถอดความจากโจทย์ลูกค้า",
  "vibeSummary": "คำอธิบายมู้ดแอนด์โทนสไตล์ธรรมชาติ 2-3 ประโยค",
  "colorPaletteRecommendation": {
    "title": "ชื่อพาเลทสีสไตล์ธรรมชาติ เช่น Warm Cream & Stone",
    "colors": [
      { "hex": "#...", "name": "ชื่อสีออร์แกนิก", "proportion": "60% หรือ 30% หรือ 10%", "reason": "เหตุผลสั้นๆ" }
    ]
  },
  "typographyGuide": {
    "headingFont": "แนะนำฟอนต์หัวข้อ เช่น Playfair Display หรือ Noto Serif Thai",
    "bodyFont": "แนะนำฟอนต์เนื้อหา เช่น Prompt / Inter",
    "rationale": "เหตุผลการจับคู่ฟอนต์นี้"
  },
  "layoutBestPractices": [
    "เทคนิคการจัดวางข้อ 1 เช่น กริดหรือสัดส่วนพื้นที่ว่าง",
    "เทคนิคข้อ 2"
  ],
  "referenceInspirations": [
    { "title": "ชื่อสไตล์เรฟ 1", "desc": "คำอธิบายสั้นๆ", "aspect": "จุดเด่นที่ควรนำมาใช้" },
    { "title": "ชื่อสไตล์เรฟ 2", "desc": "คำอธิบายสั้นๆ", "aspect": "จุดเด่นที่ควรนำมาใช้" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `วิเคราะห์โปรเจกต์ดีไซน์นี้: "${prompt}" (ความชอบล่าสุด: ${currentVibe || 'เรียบง่าย ธรรมชาติ สบายตา'})` }] }
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json({ success: true, consultation: parsedData });
    } catch (err: any) {
      console.error('AI Consult Error:', err);
      // Fallback response if API key is missing or quota limits
      return res.json({
        success: true,
        fallback: true,
        consultation: {
          projectConcept: req.body.prompt || "การออกแบบสไตล์ธรรมชาติ",
          vibeSummary: "เน้นความสะอาดตา สุภาพ และการใช้วัสดุออร์แกนิกที่ให้ความรู้สึกอบอุ่นและผ่อนคลาย",
          colorPaletteRecommendation: {
            title: "Muted Sand & Olive Sage",
            colors: [
              { hex: '#FDFCF9', name: 'Warm Paper Silk', proportion: '60%', reason: 'พื้นหลังหลักช่วยให้สบายตาและอ่านง่าย' },
              { hex: '#F2EFE9', name: 'Alabaster Stone', proportion: '25%', reason: 'ใช้สำหรับกล่องข้อความหรือการ์ดย่อย' },
              { hex: '#D9D4CC', name: 'Linen Grey', proportion: '8%', reason: 'สำหรับเส้นขอบแบ่งสัดส่วน' },
              { hex: '#5A5A40', name: 'Olive Green', proportion: '5%', reason: 'สีหลักดึงดูดสายตา (Accent CTA)' },
              { hex: '#2D2D1B', name: 'Charcoal Earth', proportion: '2%', reason: 'สีตัวอักษรเพื่อความคมชัด' }
            ]
          },
          typographyGuide: {
            headingFont: "Playfair Display / Noto Serif Thai",
            bodyFont: "Inter / Prompt Light",
            rationale: "Serif ให้ความรู้สึกนุ่มนวลมีความประณีต เมื่อคู่กับ Sans-serif จะได้ความทันสมัยอ่านง่าย"
          },
          layoutBestPractices: [
            "เว้นพื้นที่ว่างรอบองค์ประกอบหลัก (Generous White Space) เพื่อไม่ให้รู้สึกอึดอัด",
            "ใช้เส้นขอบบาง 1px สีอ่อนแทนการใส่เงาเข้ม"
          ],
          referenceInspirations: [
            { title: "Wabi-Sabi Portfolio", desc: "การนำเสนอความงามบนความไม่สมบูรณ์แบบ", aspect: "ความสมมาตรและโทนสีหินทราย" },
            { title: "Botanical E-Commerce", desc: "เว็บขายสินค้าธรรมชาติสไตล์สแกนดิเนเวียน", aspect: "การจัดเลย์เอาต์โปร่งตา" }
          ]
        }
      });
    }
  });

  // Generate Color Palette endpoint
  app.post('/api/ai-palette', async (req, res) => {
    try {
      const { keyword } = req.body;
      if (!keyword) {
        return res.status(400).json({ error: 'กรุณาระบุคำค้นหามู้ดสี' });
      }

      const ai = getAIClient();
      const promptText = `สร้างพาเลทสีสไตล์ธรรมชาติมินิมอล 5 สี สำหรับคำค้นหา: "${keyword}"
ตอบกลับเป็น JSON โครงสร้างนี้เท่านั้น:
{
  "title": "ชื่อพาเลทน่ารักสไตล์อบอุ่น",
  "category": "Earth Tone",
  "description": "คำอธิบายมู้ดสี 2 ประโยค",
  "colors": [
    { "hex": "#...", "name": "ชื่อสี", "role": "Background 60%" },
    { "hex": "#...", "name": "ชื่อสี", "role": "Surface 25%" },
    { "hex": "#...", "name": "ชื่อสี", "role": "Border 8%" },
    { "hex": "#...", "name": "ชื่อสี", "role": "Accent 5%" },
    { "hex": "#...", "name": "ชื่อสี", "role": "Text 2%" }
  ],
  "tags": ["tag1", "tag2", "tag3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: { responseMimeType: 'application/json', temperature: 0.8 }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, palette: { id: `ai-pal-${Date.now()}`, likes: Math.floor(Math.random() * 80) + 20, ...parsed } });
    } catch (err) {
      console.error('AI Palette error:', err);
      return res.json({
        success: true,
        fallback: true,
        palette: {
          id: `ai-pal-${Date.now()}`,
          title: `${req.body.keyword || 'Nature'} Harmony`,
          category: 'Earth Tone',
          description: 'พาเลทที่ได้แรงบันดาลใจจากความเรียบง่ายของธรรมชาติ สร้างความรู้สึกนิ่งและจริงใจ',
          likes: 45,
          tags: ['Natural', 'Calm', 'Minimal'],
          colors: [
            { hex: '#FDFCF9', name: 'Cotton White', role: 'Background 60%' },
            { hex: '#F0ECE3', name: 'Oatmeal', role: 'Surface 25%' },
            { hex: '#DFD3C3', name: 'Driftwood', role: 'Border 8%' },
            { hex: '#7D6E58', name: 'Warm Tobacco', role: 'Accent 5%' },
            { hex: '#2C2A26', name: 'Earth Graphite', role: 'Text 2%' }
          ]
        }
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudioRef full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
