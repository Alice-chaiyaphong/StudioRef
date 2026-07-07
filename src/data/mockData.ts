import { ReferenceDesign, ColorPalette } from '../types.ts';

export const INITIAL_REFERENCES: ReferenceDesign[] = [
  {
    id: 'ref-1',
    title: 'Minimal Japanese',
    subtitle: 'Wabi-Sabi Workspace',
    category: 'Interior & Architecture',
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
    category: 'UI/UX & Web',
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
    category: 'Packaging',
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
    category: 'Graphic Design',
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
    likes: 276,
    bookmarked: false
  },
  {
    id: 'ref-5',
    title: 'Artisan Ceramic App',
    subtitle: 'E-commerce Mobile Experience',
    category: 'UI/UX & Web',
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
    category: 'Interior & Architecture',
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
    likes: 389,
    bookmarked: false
  },
  {
    id: 'ref-7',
    title: 'Nordic Ice Spa',
    subtitle: 'Cool Minimalist Wellness Centre',
    category: 'Interior & Architecture',
    description: 'สปาและสถานที่พักผ่อนที่ออกแบบด้วยปูนเปลือยขัดสีขาวเทาคราม และอ่างน้ำหินธรรมชาติสีเข้ม คุมมู้ดโทนเย็นสุดเงียบสงบ',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    tags: ['Spa', 'Minimalist', 'Cool Tone', 'Stone', 'Wellness'],
    palette: ['#F4F7F6', '#EBF1F0', '#CBDAD5', '#3A6360', '#1E2E31'],
    typography: {
      heading: 'Outfit Light',
      body: 'IBM Plex Sans Thai',
      vibe: 'เย็นสงบ ผ่อนคลาย สะอาด ปลอดโปร่ง'
    },
    layoutNotes: [
      'จัดแสงธรรมชาติผ่านช่องกระจกสกายไลท์เพื่อขับเน้นลวดลายของพื้นผิวปูนและน้ำสีคราม',
      'เลือกใช้เฟอร์นิเจอร์รูปทรงเรขาคณิตเรียบๆ และเลี่ยงสีโทนร้อนทั้งหมด',
      'ซ่อนสวิตช์และของตกแต่งไม่จำเป็นไว้ในผนังพรีคาสต์เพื่อความเนียนตา'
    ],
    likes: 456,
    bookmarked: true
  },
  {
    id: 'ref-8',
    title: 'Slate Spruce App',
    subtitle: 'Cool-Tone Productivity Dashboard',
    category: 'UI/UX & Web',
    description: 'แอปพลิเคชันจัดการงานสำหรับนักสร้างสรรค์ มาพร้อมอินเตอร์เฟสแบบไร้ขอบ (Border-free UI) การ์ดโปร่งแสง และสีน้ำทะเลลึก',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    tags: ['Mobile UI', 'Productivity', 'Slate', 'Clean', 'Modern'],
    palette: ['#EBF1F0', '#DDE5E4', '#7A938E', '#3A6360', '#1E2E31'],
    typography: {
      heading: 'Outfit SemiBold',
      body: 'Inter & Prompt',
      vibe: 'เฉียบคม ทันสมัย มีประสิทธิภาพ เป็นระเบียบ'
    },
    layoutNotes: [
      'ใช้สัดส่วนระยะห่าง (Margins) แบบหนาพิเศษ 24px เพื่อลดความอึดอัดบนจอโทรศัพท์',
      'คุมเฉดสีเทาคราม (Cool Grey) เป็นฉากหลังเพื่อลดการเมื่อยล้าของสายตาผู้ใช้',
      'ปุ่ม Call to Action เด่นชัดด้วยสี Slate Spruce ตัดกับตัวหนังสือขาวหิมะ'
    ],
    likes: 588,
    bookmarked: false
  },
  {
    id: 'ref-9',
    title: 'Muted Ocean Brand',
    subtitle: 'Eco-Conscious Marine Packaging',
    category: 'Packaging',
    description: 'แบรนด์สกินแคร์ออร์แกนิกที่มีส่วนผสมจากสาหร่ายทะเลลึก ใช้ขวดแก้วรีไซเคิลเคลือบฝ้าสีครามพาสเทลและฝาไม้ธรรมชาติสีซีด',
    imageUrl: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80',
    tags: ['Packaging', 'Ocean', 'Sustainability', 'Eco', 'Teal'],
    palette: ['#F4F7F6', '#DDE5E4', '#CBDAD5', '#3A6360', '#1E2E31'],
    typography: {
      heading: 'IBM Plex Sans Thai (Light)',
      body: 'Inter Regular',
      vibe: 'บริสุทธิ์ ธรรมชาติ บำบัด พรีเมียมเงียบสงบ'
    },
    layoutNotes: [
      'จัดวางข้อความแบบชิดขอบซ้ายขวาอย่างสมดุล (Justified Column Alignment)',
      'พิมพ์ข้อมูลผลิตภัณฑ์ด้วยฟอนต์ไม่มีหัวขนาดจิ๋วสไตล์นอร์ดิกเพื่อคงความคลีน',
      'ใช้กล่องกระดาษสัมผัสหยาบที่ผ่านการพิมพ์ด้วยหมึกถั่วเหลืองสีเทาคราม'
    ],
    likes: 412,
    bookmarked: false
  },
  {
    id: 'ref-10',
    title: 'Frost & Quartz Portfolio',
    subtitle: 'Web Layout for Interactive Design Studio',
    category: 'UI/UX & Web',
    description: 'มิติมุมมองเว็บพอร์ตโฟลิโอแนวทดลอง มีลูกเล่น Glassmorphism ซ้อนทับเลเยอร์หิมะและฟอนต์ดิสเพลย์สุดโฉบเฉี่ยว',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: ['Web UI', 'Glassmorphism', 'Experimental', 'Interactive', 'Art'],
    palette: ['#F4F7F6', '#EBF1F0', '#B8CAC4', '#2E8B90', '#1E2E31'],
    typography: {
      heading: 'Outfit Bold (Extended)',
      body: 'Inter Light',
      vibe: 'ล้ำยุค ทรงพลัง เฉียบคม ครีเอทีฟสูง'
    },
    layoutNotes: [
      'ประยุกต์ใช้เอฟเฟกต์ backdrop-blur-md บนการ์ดแบบลอยเพื่อล้อไปกับผิวสัมผัสกระจกฝ้า',
      'การนำสายตาด้วยเส้นแบ่งพิกเซลเดี่ยวสี #B8CAC4 ที่ตอบสนองต่อการวางเมาส์ (Hover)',
      'จัดหน้าเว็บแบบ Responsive ลื่นไหลตั้งแต่จอหน้ากว้าง 4K ไปจนถึงแนวตั้งของสมาร์ทโฟน'
    ],
    likes: 675,
    bookmarked: false
  },
  {
    id: 'ref-11',
    title: 'Alumiluxe Ergo',
    subtitle: 'Anodized Aluminum Task Chair',
    category: 'Product Design',
    description: 'เก้าอี้ทำงานตามหลักสรีรศาสตร์ ผลิตจากอลูมิเนียมชุบอโนไดซ์ผิวด้านโทนเย็น มีจังหวะโครงสร้างเว้าโค้งที่พยุงรับแผ่นหลังได้อย่างลงตัว',
    imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
    tags: ['Furniture', 'Industrial', 'Aluminum', 'Ergonomic', 'Minimalist'],
    palette: ['#F4F7F6', '#DDE5E4', '#CBDAD5', '#3A6360', '#1E2E31'],
    typography: {
      heading: 'Space Grotesk Regular',
      body: 'Inter Medium',
      vibe: 'หรูหราอุตสาหกรรม มั่นคง เฉียบคม แข็งแรง'
    },
    layoutNotes: [
      'การใช้ผิวสัมผัสโลหะขัดเงาสะท้อนแสงไฟสตูดิโอแบบนุ่มนวลเพื่อขับเน้นส่วนโค้งงอไฮไลต์',
      'ใช้ชิ้นส่วนยึดติดด้วยสกรูหกเหลี่ยมสีดำสนิทเป็นจุดนำสายตาเล็กๆ ช่วยเสริมความประณีต',
      'ออกแบบชิ้นส่วนพลาสติกชีวภาพรีไซเคิลสีเทาเข้มเนื้อทรายในส่วนข้อต่อสำคัญเพื่อความพรีเมียม'
    ],
    likes: 312,
    bookmarked: false
  },
  {
    id: 'ref-12',
    title: 'Neo-Glacier Motion',
    subtitle: 'Interactive Screen Exhibition Branding',
    category: 'Digital Media',
    description: 'อัตลักษณ์สื่อดิจิทัลและงานโมชั่นกราฟิกสไตล์ไฮบริด ผสานการใช้แสงออโรร่าสีฟ้าน้ำแข็งประยุกต์เข้ากับอนิเมชั่นพิมพ์ดีดแนวอินเตอร์แอคทีฟ',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    tags: ['Motion', 'Digital Art', 'Exhibition', 'Aurora', 'Glitch'],
    palette: ['#EBF1F0', '#B8CAC4', '#7A938E', '#2E8B90', '#1E2E31'],
    typography: {
      heading: 'Outfit Light (Spaced)',
      body: 'JetBrains Mono',
      vibe: 'ล้ำสมัย ไซไฟ คอนเซปต์ชวล ตอบสนองฉับไว'
    },
    layoutNotes: [
      'คุมสปีดอนิเมชั่นเฟดที่จังหวะหน่วง 0.6 วินาที (Cubic-bezier) เพื่อจำลองความเคลื่อนไหวของสายน้ำแข็งเกาะ',
      'แทรกเส้นตารางพิกเซลละเอียดบาง 0.5px เพื่อจำลองฟีลหน้าจอโปรเจกต์มอนิเตอร์ระดับห้องแล็บ',
      'จัดสเกลตัวอักษรรหัสเลขคู่วันที่เวลาให้มีขนาดเล็กจิ๋ววางมุมขวาบนเป็นเสมือนลายน้ำเก๋ๆ'
    ],
    likes: 494,
    bookmarked: false
  },
  {
    id: 'ref-13',
    title: 'Aero-Sound 1',
    subtitle: 'Cast Aluminum Minimalist Speaker',
    category: 'Product Design',
    description: 'ลำโพงไร้สายรูปทรงเรขาคณิตเรียบง่าย หล่อขึ้นรูปจากโลหะอลูมิเนียมแอร์คราฟท์เกรด ตกแต่งช่องกระจายเสียงด้วยผ้าวูลคัดพิเศษโทนครามพาสเทล',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    tags: ['Speaker', 'Audio', 'Metallic', 'Scandinavian', 'Tech'],
    palette: ['#F4F7F6', '#EBF1F0', '#CBDAD5', '#3A6360', '#131D20'],
    typography: {
      heading: 'Outfit Bold',
      body: 'Inter Light',
      vibe: 'อบอุ่นนวัตกรรม พรีเมียม เรียบหรู ละมุนละไม'
    },
    layoutNotes: [
      'ออกแบบอินเตอร์เฟสปุ่มสัมผัสแบบบุ๋มลึกลงในผิวอลูมิเนียมเพื่อความเรียบเนียนระดับไร้รอยต่อ',
      'ใช้สัดส่วนทองคำในการแบ่งอัตราส่วนระหว่างพื้นที่ผิวโลหะทึบ 70% และพื้นที่ผิวผ้าวูล 30%',
      'ฐานล่างซ่อนสิลิโคนกันสั่นสีขุ่นเนื้อนิ่มเพื่อไม่ให้รบกวนผิวสัมผัสภายนอกเวลาวาง'
    ],
    likes: 520,
    bookmarked: false
  },
  {
    id: 'ref-14',
    title: 'Nordic Stream TV',
    subtitle: 'Digital Content & Streaming Overlay Set',
    category: 'Digital Media',
    description: 'ชุดเทมเพลตสำหรับผู้ผลิตสื่อดิจิทัลและสตรีมเมอร์ คุมโทนเทาหมอก สีกรีนมิ้นต์เย็น และฟอนต์โมเดิร์นปราศจากหัวใจสะอาดเรียบร้อย',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    tags: ['Streaming', 'Social Media', 'Overlay', 'Video', 'Mint'],
    palette: ['#F4F7F6', '#EBF1F0', '#CBDAD5', '#2E8B90', '#131D20'],
    typography: {
      heading: 'Outfit ExtraBold',
      body: 'Prompt Light',
      vibe: 'น่าดึงดูด โปร่งตา สนุกแบบมินิมอล มีระดับ'
    },
    layoutNotes: [
      'ใช้เส้นขอบเทมเพลตกรอบกล้องเว็บแคมที่มีความหนาเพียง 2px ตัดเฉดเขียวมิ้นต์สะท้อนตาบนพื้นเทาเข้ม',
      'กำหนดพื้นที่ Safe Zone เผื่อขอบจอ 10% สำหรับจัดวางกล่องแชทเรียลไทม์แบบไร้กรอบหลังทึบ',
      'ทำไอคอนป้ายแจ้งเตือนให้ใช้ระบบสีสองเฉด ครามสว่าง #2E8B90 คู่กับเขียวน้ำแข็งเพื่อแสดงลำดับความสำคัญ'
    ],
    likes: 382,
    bookmarked: false
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
  },
  {
    id: 'pal-5',
    title: 'Ice Mint Breeze',
    category: 'Cool Modern',
    description: 'คู่สีโทนเย็นที่ให้ความรู้สึกเย็นสบาย ปลอดโปร่ง และล้ำสมัย เหมาะสำหรับแอปพลิเคชันยุคใหม่ เว็บไซต์สถาปัตยกรรม และงานดีไซน์ที่เน้นความโปร่งตา',
    likes: 724,
    tags: ['Ice Mint', 'Slate Spruce', 'Modern', 'Cool Tone'],
    colors: [
      { hex: '#F4F7F6', name: 'Ice Mint Canvas', role: 'Background 60%', percentage: 60 },
      { hex: '#EBF1F0', name: 'Glacier Breeze', role: 'Surface 20%', percentage: 20 },
      { hex: '#DDE5E4', name: 'Frost Grey', role: 'Borders 10%', percentage: 10 },
      { hex: '#3A6360', name: 'Slate Spruce', role: 'Primary Accent 7%', percentage: 7 },
      { hex: '#1E2E31', name: 'Deep Abyss', role: 'Typography 3%', percentage: 3 }
    ]
  },
  {
    id: 'pal-6',
    title: 'Deep Alpine Spruce',
    category: 'Nordic Botanical',
    description: 'สัมผัสความลึกของป่าสนภูเขาสูงในเวลากลางคืน โดดเด่นด้วยโทนเขียวอมฟ้าหม่นคู่กับเทาหินธรรมชาติ',
    likes: 584,
    tags: ['Alpine', 'Spruce', 'Forest', 'Muted Teal'],
    colors: [
      { hex: '#EBF1F0', name: 'Alpine Mist', role: 'Background 60%', percentage: 60 },
      { hex: '#CBDAD5', name: 'Quartzite', role: 'Surface 20%', percentage: 20 },
      { hex: '#7A938E', name: 'Muted Juniper', role: 'Borders 10%', percentage: 10 },
      { hex: '#2E8B90', name: 'Deep Teal', role: 'Accent 7%', percentage: 7 },
      { hex: '#131D20', name: 'Midnight Spruce', role: 'Typography 3%', percentage: 3 }
    ]
  }
];
