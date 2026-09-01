export interface ColorSpecification {
  hex: string;
  name: string;
  percentage?: number;
  role: string; // e.g., 'Background 60%', 'Primary Card 30%', 'Accent Text 10%'
}

export interface ColorPalette {
  id: string;
  title: string;
  category: string;
  description: string;
  colors: ColorSpecification[];
  tags: string[];
  likes: number;
  userId?: string;
  userName?: string;
}

export interface LocationInfo {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
  mapsUrl?: string;
  city?: string;
  country?: string;
  highlights?: string[];
  bestTime?: string;
  aestheticType?: string;
}

export interface DesignLocation {
  id: string;
  title: string;
  subtitle: string;
  category: 'Cafe & Dining' | 'Architecture & Studio' | 'Art Gallery & Museum' | 'Craft & Workshop' | 'Botanical & Nature' | 'Co-working & Library';
  description: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  mapsUrl: string;
  city: string;
  country: string;
  rating?: number;
  aestheticTags: string[];
  palette: string[];
  referenceId?: string;
  designHighlights: string[];
  bestAngleTip: string;
  likes?: number;
}

export interface ReferenceDesign {
  id: string;
  title: string;
  subtitle: string;
  category: string;
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
  userId?: string;
  userName?: string;
  location?: LocationInfo;
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
