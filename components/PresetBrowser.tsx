
import React from 'react';
import { Copy, Edit3 } from 'lucide-react';
import { PRESETS, Preset } from '../data/presets';
import { VisualizerConfig } from '../types';
import { generateThreeJSCode } from '../utils/exportTemplates';

interface PresetBrowserProps {
  onSelectPreset: (config: VisualizerConfig) => void;
}

const PresetBrowser: React.FC<PresetBrowserProps> = ({ onSelectPreset }) => {
  const handleCopyCode = (e: React.MouseEvent, preset: Preset) => {
    e.stopPropagation();
    const code = generateThreeJSCode(preset.config);
    navigator.clipboard.writeText(code);
    
    // Simple visual feedback
    const btn = e.currentTarget as HTMLButtonElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied</span>`;
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-[#1C1C1C] text-[#e4e4e7] font-sans flex flex-col items-center py-20 px-6 3xl:py-32 overflow-y-auto">
      
      {/* Header */}
      <header className="text-center mb-16 3xl:mb-24 max-w-2xl 4xl:max-w-3xl transform 3xl:scale-110 transition-transform shrink-0">
        <h1 className="text-4xl 4xl:text-5xl font-bold tracking-tight text-white mb-4">Wave Visualisation</h1>
        <p className="text-white/40 text-sm 4xl:text-base leading-relaxed max-w-md 4xl:max-w-xl mx-auto">
          Experimental audio-reactive presets. Preview distinct visual styles, 
          customize them in the editor, or export production-ready code.
        </p>
      </header>

      {/* Grid - Fixed 2 columns, scaled max-width */}
      <div className="grid grid-cols-2 gap-8 3xl:gap-12 4xl:gap-16 w-full max-w-5xl 3xl:max-w-6xl 4xl:max-w-7xl pb-20">
        {PRESETS.map((preset) => (
          <div 
            key={preset.id}
            className="group relative bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden hover:border-zinc-600 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50"
          >
            {/* Video Container */}
            <div className="relative aspect-[16/10] bg-black overflow-hidden border-b border-[#27272a] group-hover:border-zinc-700 transition-colors">
              <video 
                src={preset.videoUrl}
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-60"></div>
            </div>

            {/* Content */}
            <div className="p-6 3xl:p-8 4xl:p-10 flex flex-col gap-4 3xl:gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg 3xl:text-xl 4xl:text-2xl font-bold text-white tracking-wide group-hover:text-emerald-400 transition-colors">
                  {preset.name}
                </h3>
              </div>

              <div className="flex items-center gap-3 mt-2 3xl:mt-4">
                <button 
                  onClick={() => onSelectPreset({ ...preset.config, name: preset.name })}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black h-10 3xl:h-12 4xl:h-14 rounded-full text-xs 3xl:text-sm font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors active:scale-95"
                >
                  <Edit3 size={14} className="3xl:w-4 3xl:h-4" />
                  Edit Preset
                </button>
                
                <button 
                  onClick={(e) => handleCopyCode(e, preset)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#27272a] text-zinc-400 border border-transparent h-10 3xl:h-12 4xl:h-14 rounded-full text-xs 3xl:text-sm font-bold uppercase tracking-wider hover:text-white hover:border-zinc-600 transition-all active:scale-95"
                >
                  <Copy size={14} className="3xl:w-4 3xl:h-4" />
                  Copy Code
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresetBrowser;
