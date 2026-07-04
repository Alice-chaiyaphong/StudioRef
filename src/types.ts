export interface ColorSpecification {
  hex: string;
  name: string;
  percentage?: number;
  role: string; // e.g., 'Background 60%', 'Primary Card 30%', 'Accent Text 10%'
}

export interface ColorPalette {
  id: string;
  title: string;
  category: 'Earth Tone' | 'Warm Cream' | 'Nordic Botanical' | 'Soft Minimal' | 'Muted Terracotta' | 'Japanese Zen';
  description: string;
  colors: ColorSpecification[];
  tags: string[];
  likes: number;
}

export interface ReferenceDesign {
  id: string;
  title: string;
  subtitle: string;
  category: 'Interior' | 'Web Design' | 'Branding' | 'Packaging' | 'Mobile App' | 'Editorial Portfolio' | 'Architecture';
  description: string;
  imageUrl: string;
  tags: string[];
  palette: string[]; // array of hex codes
  typography: {
    heading: string;
    body: string;
    vibe: string;
  };
  layoutNotes: string[];
  likes: number;
  bookmarked?: boolean;
}

export interface AIAssistantConsultation {
  projectConcept: string;
  vibeSummary: string;
  colorPaletteRecommendation: {
    title: string;
    colors: { hex: string; name: string; proportion: string; reason: string }[];
  };
  typographyGuide: {
    headingFont: string;
    bodyFont: string;
    rationale: string;
  };
  layoutBestPractices: string[];
  referenceInspirations: {
    title: string;
    desc: string;
    aspect: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  aiConsultation?: AIAssistantConsultation;
}
