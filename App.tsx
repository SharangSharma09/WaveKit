import React from 'react';
import VisualizerEditor from './components/VisualizerEditor';

const App: React.FC = () => {
  // VisualizerEditor is now the main homepage
  return (
    <VisualizerEditor 
      initialConfig={undefined} 
      onBack={() => {}} // No-op since there's no back navigation
    />
  );
};

export default App;