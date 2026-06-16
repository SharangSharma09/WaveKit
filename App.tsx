import React, { useState } from 'react';
import VisualizerEditor from './components/VisualizerEditor';
import OrbPage from './components/OrbPage';

type Page = 'editor' | 'orb';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('editor');

  if (activePage === 'orb') {
    return <OrbPage onBack={() => setActivePage('editor')} />;
  }

  return (
    <VisualizerEditor
      initialConfig={undefined}
      onBack={() => {}}
      onNavigateToOrb={() => setActivePage('orb')}
    />
  );
};

export default App;