import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import PlanetCanvas from './components/PlanetCanvas';
import { defaultPlanetSettings, PlanetSettings } from './types/planet';
import './App.css';

const App: React.FC = () => {
  const [settings, setSettings] = useState<PlanetSettings>(defaultPlanetSettings);

  return (
    <div className="app">
      <ControlPanel settings={settings} onSettingsChange={setSettings} />

      <main className="canvas-area">
        <div className="canvas-toolbar">
          <span className="toolbar-title">Procedural World Builder</span>
        </div>
        <div className="canvas-viewport">
          <PlanetCanvas settings={settings} />
        </div>
      </main>
    </div>
  );
};

export default App;
