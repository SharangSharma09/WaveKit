import React, { useState } from 'react';
import Homepage from './components/Homepage';
import VisualizerEditor from './components/VisualizerEditor';
import { VisualizerConfig } from './types';

enum AppView {
  LANDING = 'LANDING',
  EDITOR = 'EDITOR'
}

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [initialConfig, setInitialConfig] = useState<VisualizerConfig | undefined>(undefined);

  const handleSelectPreset = (config: VisualizerConfig) => {
    setInitialConfig(config);
    setView(AppView.EDITOR);
  };

  if (view === AppView.EDITOR) {
    // We mount a fresh editor when switching to ensure state initializes from props
    return (
      <VisualizerEditor 
        key="editor" 
        initialConfig={initialConfig} 
        onBack={() => setView(AppView.LANDING)}
      />
    );
  }

  return <Homepage onSelectPreset={handleSelectPreset} />;
};

export default App;