import React, { useState } from 'react';
import { ReferenceDesign, ColorPalette } from './types.ts';
import { INITIAL_REFERENCES, CURATED_PALETTES } from './data/mockData.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { ExploreView } from './components/ExploreView.tsx';
import { PaletteStudioView } from './components/PaletteStudioView.tsx';
import { AIAssistantView } from './components/AIAssistantView.tsx';
import { SavedMoodboardView } from './components/SavedMoodboardView.tsx';
import { ReferenceDetailModal } from './components/ReferenceDetailModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'palettes' | 'ai' | 'saved'>('explore');
  const [references, setReferences] = useState<ReferenceDesign[]>(INITIAL_REFERENCES);
  const [palettes, setPalettes] = useState<ColorPalette[]>(CURATED_PALETTES);
  const [selectedReference, setSelectedReference] = useState<ReferenceDesign | null>(null);
  const [aiConsultPrompt, setAiConsultPrompt] = useState<string | undefined>(undefined);

  // Bookmark toggle handler
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReferences(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, bookmarked: !item.bookmarked };
      }
      return item;
    }));

    if (selectedReference && selectedReference.id === id) {
      setSelectedReference(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
    }
  };

  const handleOpenAIAssistant = (promptText?: string) => {
    if (promptText) {
      setAiConsultPrompt(promptText);
    }
    setActiveTab('ai');
  };

  const handleAddCustomPalette = (newPal: ColorPalette) => {
    setPalettes(prev => [newPal, ...prev]);
  };

  const savedCount = references.filter(r => r.bookmarked).length;

  return (
    <div className="h-screen w-full bg-[#F4F7F6] text-[#2C3E42] flex flex-col md:flex-row overflow-hidden font-sans select-none" style={{ backgroundColor: '#F4F7F6' }}>
      {/* Fixed Left Navigation Rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        savedCount={savedCount}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
        {activeTab === 'explore' && (
          <ExploreView 
            references={references}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onToggleBookmark={handleToggleBookmark}
            onOpenAIAssistant={handleOpenAIAssistant}
          />
        )}

        {activeTab === 'palettes' && (
          <PaletteStudioView 
            palettes={palettes}
            onAddPalette={handleAddCustomPalette}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantView 
            initialPrompt={aiConsultPrompt}
          />
        )}

        {activeTab === 'saved' && (
          <SavedMoodboardView 
            savedReferences={references.filter(r => r.bookmarked)}
            onSelectReference={(ref) => setSelectedReference(ref)}
            onToggleBookmark={handleToggleBookmark}
            onExploreMore={() => setActiveTab('explore')}
          />
        )}
      </div>

      {/* Reference Modal Specs Detail */}
      <ReferenceDetailModal 
        design={selectedReference}
        onClose={() => setSelectedReference(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}
