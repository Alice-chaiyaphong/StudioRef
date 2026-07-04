import { ReferenceDesign, ColorPalette } from '../types.ts';

export const INITIAL_REFERENCES: ReferenceDesign[] = [
  {
    id: 'ref-1',
    title: 'Minimal Japanese',
    subtitle: 'Wabi-Sabi Workspace',
    category: 'Interior',
    description: 'เน้นความสงบและวัสดุไม้ธรรมชาติ เปิดรับแสงแดดอ่อนและใช้วัสดุผ้าลินินสีหินทราย',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    tags: ['Japanese', 'Wood', 'Calm', 'Beige', 'Cream'],
    palette: ['#FDFCF9', '#D9D4CC', '#5A5A40', '#3E3C38', '#2D2D1B'],
    typography: {
      heading: 'Noto Serif (Light Slender)',
      body: 'Inter & Prompt',
      vibe: 'สงบ อบอุ่น มีสมาธิ สะอาดตา'
    },
    layoutNotes: [
      'ใช้ White Space (พื้นที่ว่าง) อย่างน้อย 40% ของพื้นที่ทั้งหมด',
      'จัดวางเส้นตรงซ้ายขวาอย่างสมมาตรสลับกับความโค้งมนของถ้วยเซรามิก',
      'คุมโทนสีไม้โอ๊คอ่อนคู่กับผนังปูนเปลือยขัดมันสีขาวครีม'
    ],
    likes: 342,
    bookmarked: true
  },
  {
    id: 'ref-2',
    title: 'Clean Portfolio',
    subtitle: 'Nordic Architectural Studio',
    category: 'Web Design',
    description: 'เน้นการจัดวาง Layout ที่โปร่ง Grid แบบ 3-Column และตัวอักษร Serif ขนาดใหญ่',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: ['Web UI', 'Editorial', 'Minimal', 'Grid', 'Typography'],
    palette: ['#F9F7F2', '#EBE7E0', '#7C786F', '#2D2D1B'],
    typography: {
      heading: 'Playfair Display Italic',
      body: 'Inter (Sans-serif)',
      vibe: 'พรีเมียม ร่วมสมัย น่าเชื่อถือ'
    },
    layoutNotes: [
      'หัวข้อหลักใช้ Serif Italic ตัวเอียงเพื่อสร้างอารมณ์ศิลปะ (Editorial look)',
      'เมนูนำทางด้านซ้าย (Left Fixed Rail) ช่วยให้โฟกัสผลงานตรงกลางได้นิ่งขึ้น',
      'เส้นขอบบางเฉียบสี #EBE7E0 แบ่งสัดส่วนโดยไม่รบกวนสายตา'
    ],
    likes: 518,
    bookmarked: true
  },
  {
    id: 'ref-3',
    title: 'Organic Cosmetics',
    subtitle: 'Botanical Skincare Packaging',
    category: 'Branding',
    description: 'การใช้สี Earth Tone มะกอกเข้ม และขวดแก้วขุ่นทรงโค้งมนเป็นมิตรต่อสิ่งแวดล้อม',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    tags: ['Branding', 'Skincare', 'Earth Tone', 'Olive', 'Glass'],
    palette: ['#F5F5F0', '#CAC5BC', '#5A5A40', '#2D2D1B'],
    typography: {
      heading: 'Cormorant Garamond',
      body: 'Prompt Light',
      vibe: 'ออร์แกนิก สะอาด ปลอดภัย ละมุน'
    },
    layoutNotes: [
      'ฉลากสินค้าเน้นคำอธิบายส่วนผสมด้วยตัวอักษร Monospace เท่ๆ',
      'แพ็กเกจจิ้งสีหินอ่อนและสีเขียวมะกอกสื่อถึงสารสกัดจากใบไม้และธรรมชาติ',
      'ถ่ายภาพบนพื้นผิวหินขรุขระเพื่อให้เกิดมิติ Contrast ระหว่างความนุ่มนวลและธรรมชาติ'
    ],
    likes: 429,
    bookmarked: false
  },
  {
    id: 'ref-4',
    title: 'Kinfolk Magazine',
    subtitle: 'Editorial Spread Layout',
    category: 'Editorial Portfolio',
    description: 'จัดหน้ากระดาษและบทความด้วยภาพใหญ่สลับหน้าต่างคอลัมน์คู่ สบายตาเหมือนอ่านหนังสือพิมพ์แนวโมเดิร์น',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    tags: ['Magazine', 'Layout', 'Print', 'Cozy', 'Warm'],
    palette: ['#FDFCF9', '#F2EFE9', '#D9D4CC', '#3E3C38'],
    typography: {
      heading: 'Playfair Display Bold',
      body: 'Noto Serif Thai Regular',
      vibe: 'นักอ่าน คลาสสิก อบอุ่น มีเรื่องราว'
    },
    layoutNotes: [
      'ดึง Quote เด็ดออกมาไว้กลางหน้าด้วยฟอนต์ Serif ตัวใหญ่พิเศษ',
      'จังหวะย่อหน้าระยะบรรทัด (Line-height) กว้าง 1.8 เพื่อความลื่นไหลในการอ่านยาวๆ'
    ],
    likes: 276
  },
  {
    id: 'ref-5',
    title: 'Artisan Ceramic App',
    subtitle: 'E-commerce Mobile Experience',
    category: 'Mobile App',
    description: 'แอปคราฟต์สินค้าแฮนด์เมด ปุ่มโค้งมนนุ่มนวล (Soft Radius) และสีหลังครีมอุ่น',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
    tags: ['Mobile UI', 'Shop', 'Pottery', 'Soft', 'UX/UI'],
    palette: ['#F9F7F2', '#E5E2DA', '#A8A49C', '#5A5A40', '#2D2D1B'],
    typography: {
      heading: 'Prompt Medium',
      body: 'Inter Regular',
      vibe: 'ซื้อง่าย อุ่นใจ ใส่ใจรายละเอียด'
    },
    layoutNotes: [
      'การใช้เงาแบบ Soft Shadow ฟุ้งๆ สี #D9D4CC สร้างมิติคล้ายกระดาษลอยอยู่',
      'ชิ้นงานคราฟต์เด่นขึ้นเมื่อพื้นหลังไม่มีสีสันฉูดฉาดมารบกวน'
    ],
    likes: 612,
    bookmarked: true
  },
  {
    id: 'ref-6',
    title: 'Matcha & Stone',
    subtitle: 'Concept Specialty Tea Bar',
    category: 'Architecture',
    description: 'การตกแต่งร้านชาเขียวบาร์เปิดโล่ง ใช้เคาน์เตอร์หินขัดสีเทาอมเบจตัดกับต้นบอนไซ',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    tags: ['Cafe', 'Matcha', 'Zen', 'Stone', 'Architecture'],
    palette: ['#F2EFE9', '#D9D4CC', '#5A5A40', '#4A4A32', '#1E1E14'],
    typography: {
      heading: 'Outfit / Space Grotesk',
      body: 'Inter Light',
      vibe: 'สุขุม จริงจัง พิถีพิถัน สุนทรีย์'
    },
    layoutNotes: [
      'แสงไฟ Indirect Light ซ่อนตามซอกใต้โต๊ะสร้างมิติไม่แยงตาลูกค้า',
      'สีชาเขียวมัทฉะ #5A5A40 กลายเป็น Hero Color ของร้าน'
    ],
    likes: 389
  }
];

export const CURATED_PALETTES: ColorPalette[] = [
  {
    id: 'pal-1',
    title: 'Signature Cream & Olive',
    category: 'Earth Tone',
    description: 'คู่สีคลาสสิกของ StudioRef ให้ความรู้สึกผ่อนคลาย เรียบหรู ไม่ตกยุค เหมาะกับทั้งงาน Interior และ UI Design',
    likes: 840,
    tags: ['Cream', 'Olive', 'Minimal', 'Signature'],
    colors: [
      { hex: '#FDFCF9', name: 'Warm Paper', role: 'Background 60%', percentage: 60 },
      { hex: '#F9F7F2', name: 'Soft Linen', role: 'Surface / Sidebar 20%', percentage: 20 },
      { hex: '#EBE7E0', name: 'Muted Stone', role: 'Borders & Lines 10%', percentage: 10 },
      { hex: '#5A5A40', name: 'Deep Olive', role: 'Primary Accent 7%', percentage: 7 },
      { hex: '#2D2D1B', name: 'Charcoal Earth', role: 'Typography 3%', percentage: 3 }
    ]
  },
  {
    id: 'pal-2',
    title: 'Nordic Clay & Sand',
    category: 'Muted Terracotta',
    description: 'โทนสีอบอุ่นสไตล์สแกนดิเนเวีย ได้รับแรงบันดาลใจจากดินเผาบ่มแดดและหาดทรายยามเช้า',
    likes: 620,
    tags: ['Nordic', 'Terracotta', 'Warm', 'Cozy'],
    colors: [
      { hex: '#F9F6F0', name: 'Oat Milk', role: 'Background 60%', percentage: 60 },
      { hex: '#EADDED', name: 'Warm Sand', role: 'Secondary Cards 25%', percentage: 25 },
      { hex: '#C4B5A5', name: 'Sunbaked Clay', role: 'Subtle Graphic 8%', percentage: 8 },
      { hex: '#B86B52', name: 'Muted Terracotta', role: 'Call to Action 4%', percentage: 4 },
      { hex: '#3B332C', name: 'Espresso Roast', role: 'Body Text 3%', percentage: 3 }
    ]
  },
  {
    id: 'pal-3',
    title: 'Japanese Moss & Stone',
    category: 'Japanese Zen',
    description: 'ความสงบเงียบของสวนหินญี่ปุ่นและตะไคร่น้ำสีเขียวอมเทา ให้สมาธิและความสุภาพ',
    likes: 532,
    tags: ['Zen', 'Japanese', 'Moss', 'Stone'],
    colors: [
      { hex: '#F4F4F2', name: 'Zen Pebbles', role: 'Background 60%', percentage: 60 },
      { hex: '#E2E2DC', name: 'Foggy Grey', role: 'Panel 20%', percentage: 20 },
      { hex: '#B8B8AA', name: 'Dried Reed', role: 'Border 10%', percentage: 10 },
      { hex: '#4F5E4D', name: 'Forest Moss', role: 'Brand Hero 7%', percentage: 7 },
      { hex: '#262A25', name: 'Deep Granite', role: 'Headings 3%', percentage: 3 }
    ]
  },
  {
    id: 'pal-4',
    title: 'Editorial Alabaster',
    category: 'Soft Minimal',
    description: 'โทนสีสำหรับนิตยสารแฟชั่นและหนังสือดีไซน์ สะอาดตา โปร่งสบาย ดึงตัวหนังสือให้โดดเด่น',
    likes: 495,
    tags: ['Editorial', 'Clean', 'White', 'Black'],
    colors: [
      { hex: '#FFFFFF', name: 'Pure Alabaster', role: 'Canvas 70%', percentage: 70 },
      { hex: '#F4F3F0', name: 'Silk Grey', role: 'Highlight Cards 20%', percentage: 20 },
      { hex: '#D7D5CF', name: 'Hairline Divider', role: 'Lines 5%', percentage: 5 },
      { hex: '#7A7873', name: 'Muted Caption', role: 'Secondary Text 3%', percentage: 3 },
      { hex: '#1C1B18', name: 'Obsidian Ink', role: 'Display Serif 2%', percentage: 2 }
    ]
  }
];
