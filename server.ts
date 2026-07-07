import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Configure Cloudinary with user-supplied credentials or env override
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'djqk7kine',
  api_key: process.env.CLOUDINARY_API_KEY || '939785846112433',
  api_secret: process.env.CLOUDINARY_API_SECRET || '4F-FrVBj3DQ1dgufLUxEIuG0VJ0',
  secure: true
});

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

  // Increase limit for base64 image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Cloudinary image upload endpoint
  app.post('/api/upload', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'กรุณาระบุรูปภาพที่ต้องการอัปโหลด' });
      }

      // Upload base64 representation directly to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'ref_designs',
        resource_type: 'image'
      });

      return res.json({
        success: true,
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id
      });
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ error: 'ไม่สามารถอัปโหลดรูปภาพได้: ' + (err.message || err) });
    }
  });

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
      const systemInstruction = `คุณคือ StudioRef AI Senior Design Consultant ที่เชี่ยวชาญการให้คำแนะนำครอบคลุมทุกสาขางานดีไซน์: ทั้งนักออกแบบกราฟิก (Graphic), สื่อดิจิทัล (Digital Media), นักออกแบบผลิตภัณฑ์ (Product Design), ยูไอ/ยูเอ็กซ์และเว็บ (UI/UX & Web), บรรจุภัณฑ์ (Packaging) และสถาปัตยกรรม/ภายใน (Interior & Architecture)
เน้นการคุมสไตล์เรียบเท่ ทันสมัย โทนสีเย็น (Cool Tone) และความมินิมอลเฉียบคม ปลอดโปร่ง
ให้คำแนะนำนักออกแบบภาษาไทยด้วยน้ำเสียงน่าดึงดูด มืออาชีพ ทันสมัย คอนเซปต์แน่น
วิเคราะห์โจทย์ข้อความของลูกค้า แล้วให้คำแนะนำสไตล์งาน โทนสีเย็น (พร้อมรหัส HEX 4-5 สี) ฟอนต์ และไอเดียการจัดวาง/การใช้วัสดุที่เหมาะสมกับประเภทสายงานนั้นๆ
ตอบกลับเป็นรูปแบบ JSON โครงสร้างนี้เท่านั้น:
{
  "projectConcept": "สรุปสั้นๆ ถอดความจากโจทย์ลูกค้าและสายดีไซน์ที่เหมาะสม",
  "vibeSummary": "คำอธิบายมู้ดแอนด์โทนสไตล์เย็นมินิมอล 2-3 ประโยค",
  "colorPaletteRecommendation": {
    "title": "ชื่อพาเลทสีสไตล์เย็นมินิมอล เช่น Slate Spruce & Frost Mint",
    "colors": [
      { "hex": "#...", "name": "ชื่อสีภาษาไทยเก๋ๆ", "proportion": "60% หรือ 25% หรือ 10% หรือ 5%", "reason": "เหตุผลดีไซน์และบทบาทของสี" }
    ]
  },
  "typographyGuide": {
    "headingFont": "แนะนำฟอนต์หัวข้อ เช่น Outfit / Space Grotesk / Playfair Display",
    "bodyFont": "แนะนำฟอนต์เนื้อหา เช่น Prompt / Inter / JetBrains Mono / IBM Plex Sans Thai",
    "rationale": "เหตุผลการจับคู่ฟอนต์นี้เพื่อเสริมสไตล์ของสายงาน"
  },
  "layoutBestPractices": [
    "เทคนิคการจัดวาง ระยะห่าง พื้นผิว หรือการเลือกใช้วัสดุสำหรับประเภทสายงานนั้นๆ ข้อ 1",
    "เทคนิคข้อ 2",
    "เทคนิคข้อ 3"
  ],
  "referenceInspirations": [
    { "title": "ชื่อสไตล์เรฟ 1", "desc": "คำอธิบายเชิงวิชาชีพดีไซน์", "aspect": "จุดเด่นเชิงเทคนิคที่ควรนำมาใช้" },
    { "title": "ชื่อสไตล์เรฟ 2", "desc": "คำอธิบายเชิงวิชาชีพดีไซน์", "aspect": "จุดเด่นเชิงเทคนิคที่ควรนำมาใช้" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `วิเคราะห์โปรเจกต์ดีไซน์นี้: "${prompt}" (ความชอบล่าสุด: ${currentVibe || 'เรียบหรู มินิมอล โทนเย็น สะอาดตา'})` }] }
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
          projectConcept: req.body.prompt || "การออกแบบดีไซน์โทนเย็นมัลติฟังก์ชั่น",
          vibeSummary: "เน้นความสะอาดตา นวัตกรรมล้ำสมัย และการเลือกเฉดสีโทนเย็นที่ช่วยลดอาการเหนื่อยล้าของสายตาและเพิ่มระดับความพรีเมียมให้กับตัวงาน",
          colorPaletteRecommendation: {
            title: "Glacier Blue & Slate Spruce",
            colors: [
              { hex: '#F4F7F6', name: 'Ice Canvas', proportion: '60%', reason: 'พื้นหลังหลักช่วยให้รู้สึกปลอดโปร่ง ปราศจากสิ่งรบกวน' },
              { hex: '#EBF1F0', name: 'Cool Breeze', proportion: '25%', reason: 'ใช้เป็นพื้นหลังของการ์ด ลื่นไหล สบายตา' },
              { hex: '#DDE5E4', name: 'Frost Metal', proportion: '8%', reason: 'สำหรับชิ้นส่วนควบคุม เส้นแบ่งพิกเซล หรือขอบ' },
              { hex: '#3A6360', name: 'Slate Spruce', proportion: '5%', reason: 'สีนำสายตาหลักของงาน คมเข้ม มีเอกลักษณ์' },
              { hex: '#1E2E31', name: 'Deep Abyss', proportion: '2%', reason: 'สีตัวอักษรสำคัญและไอคอนเพื่อระดับ Contrast ชั้นเลิศ' }
            ]
          },
          typographyGuide: {
            headingFont: "Outfit / Space Grotesk",
            bodyFont: "Inter / Prompt Regular",
            rationale: "Outfit ไร้หัวมีความโฉบเฉี่ยวสไตล์สากล เมื่อคู่กับ Inter สไตล์ละมุนจะช่วยยกระดับความน่าเชื่อถือให้กับเนื้อหาทุกสายดีไซน์"
          },
          layoutBestPractices: [
            "จัดวางกริดที่ยืดหยุ่นสูงแบบอเนกประสงค์ (Responsive Grid & Flexible Framework)",
            "เว้นระยะขอบจอ (Margins) กว้างเป็นพิเศษไม่น้อยกว่า 24px เพื่อสร้างลุคหรูหราเบาสบายสไตล์นอร์ดิก",
            "ควบคุมค่าน้ำหนักสีและเงาแบบโปร่งตา (Glassmorphic Elements) เพื่อเพิ่มมิติเชิงลึก"
          ],
          referenceInspirations: [
            { title: "Sleek Digital Product", desc: "การออกแบบอุปกรณ์และอินเตอร์เฟสแบบไร้รอยต่อ", aspect: "การเลือกใช้ผิวสัมผัสอลูมิเนียมอโนไดซ์และสี Slate" },
            { title: "Premium Brand Collaterals", desc: "สื่อสิ่งพิมพ์และอัตลักษณ์ดิจิทัลของสตูดิโอศิลปะ", aspect: "การจัดเลย์เอาต์เน้นตัวหนังสือแนวสแกนดิเนเวีย" }
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
