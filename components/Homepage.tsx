
import React from 'react';
import { VisualizerConfig } from '../types';
import { Spline } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { DS } from '../styles/designSystem';

interface HomepageProps {
  onSelectPreset: (config: VisualizerConfig) => void;
}

const PREVIEW_IMAGE = "https://drive.google.com/thumbnail?id=1Pjps_h0Y-Q6VOHAkmZBPW2G4tK67e8AC&sz=w2000";

const Homepage: React.FC<HomepageProps> = ({ onSelectPreset }) => {
  // Helper to get a preset or fallback to the first one
  const getPresetConfig = (index: number): VisualizerConfig => {
    const preset = PRESETS[index] || PRESETS[0];
    return { ...preset.config, name: preset.name };
  };

  return (
    <div className={`h-screen w-full ${DS.homepage.bg} ${DS.homepage.title} overflow-hidden flex flex-col justify-center`}>
      {/* Main Content Area - Fixed Width 1200px, Centered Vertically */}
      <main className="w-[1200px] mx-auto grid grid-cols-12 gap-0 items-center h-full max-h-screen">

        {/* Left Section - 7 Columns */}
        <div className="col-span-7 flex flex-col justify-center gap-[3vh]">

          <div className="flex flex-col">
            {/* Header */}
            <div className="flex flex-col">
              <h1 className="font-roboto-condensed text-[5vh] font-bold text-white leading-none tracking-tight text-stroke-sm">
                Wavekit
              </h1>
              <p className={`font-roboto-mono text-[1.4vh] ${DS.homepage.description} mt-[1.4vh] leading-relaxed max-w-xl`}>
                Experimental audio-reactive presets. Preview distinct visual styles, customize them in the editor. There are five themes as Wave, Sino, Envelope
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-4 mt-[3vh] font-roboto-mono text-[1.2vh] uppercase tracking-wider">
              <span className={`cursor-pointer select-none underline underline-offset-4 ${DS.homepage.tabActive}`}>DARK</span>
              <span className={`${DS.homepage.tabInactive} cursor-not-allowed select-none`}>LIGHT</span>
            </div>

            {/* Button Grid */}
            <div className="flex flex-col gap-2 mt-[2vh]">
              {/* Row 1 */}
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={`row1-${i}`}
                    onClick={() => onSelectPreset(getPresetConfig(i))}
                    className={`w-[48px] h-[48px] ${DS.homepage.buttonBg} rounded-[8px] flex flex-col items-center justify-center transition-all group ${i === 1 ? 'border border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : `${DS.homepage.buttonBorder} ${DS.homepage.buttonHoverBorder} ${DS.homepage.buttonHoverBg}`
                      }`}
                  >
                    <Spline size={16} strokeWidth={1.5} className={`${DS.homepage.icon} mb-0.5 group-hover:text-white transition-colors`} />
                    <span className={`font-roboto-mono text-[10px] ${DS.homepage.icon} group-hover:text-white transition-colors`}>{i + 1}</span>
                  </button>
                ))}
              </div>
              {/* Row 2 */}
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button
                    key={`row2-${i}`}
                    onClick={() => onSelectPreset(getPresetConfig(i + 8))}
                    className={`w-[48px] h-[48px] ${DS.homepage.buttonBg} rounded-[8px] flex flex-col items-center justify-center ${DS.homepage.buttonBorder} ${DS.homepage.buttonHoverBorder} ${DS.homepage.buttonHoverBg} transition-all group`}
                  >
                    <Spline size={16} strokeWidth={1.5} className={`${DS.homepage.icon} mb-0.5 group-hover:text-white transition-colors`} />
                    <span className={`font-roboto-mono text-[10px] ${DS.homepage.icon} group-hover:text-white transition-colors`}>{i + 9}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control Panel Placeholder - 30vh */}
          <div className={`w-full h-[30vh] ${DS.homepage.placeholderBg} rounded-[16px] flex items-center justify-center ${DS.stroke.button} ${DS.homepage.placeholderBorder}`}>
            <span className={`font-roboto-mono ${DS.homepage.placeholderText} text-[1.2vh] uppercase tracking-widest`}>Select a preset above to begin editing</span>
          </div>

        </div>

        {/* Spacer Column */}
        <div className="col-span-1"></div>

        {/* Right Section - 4 Columns */}
        <div className="col-span-4 flex items-center justify-center">
          {/* Image Placeholder - 40vh */}
          <div className={`w-full h-[40vh] ${DS.homepage.placeholderBg} rounded-[24px] flex items-center justify-center ${DS.stroke.button} ${DS.homepage.placeholderBorder} shadow-2xl overflow-hidden group cursor-pointer`} onClick={() => onSelectPreset(getPresetConfig(0))}>
            <img
              src={PREVIEW_IMAGE}
              alt="Visualizer Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-[2vh] w-full flex items-center justify-center pointer-events-none">
        <div className={`text-center font-roboto-mono text-[1.2vh] ${DS.homepage.footerText} leading-relaxed`}>
          Made by Sharang Sharma &nbsp; | &nbsp; www.sharangsharma.in
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
