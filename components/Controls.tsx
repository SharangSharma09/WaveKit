import React from 'react';
import { Mic, MicOff, Waves, BarChart2, Settings2, Sliders, Palette, MoveHorizontal, MoveVertical, Spline, Layers, Eye, EyeOff, Zap, Activity, Hash, Origami, Waypoints, Moon, Droplets, Volume2, Code2, AlertTriangle, Sun } from 'lucide-react';
import { VisualizerMode } from '../types';

interface ControlsProps {
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  isListening: boolean;
  isSimulated: boolean;
  onToggleListening: () => void;
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  verticalShift: number;
  onVerticalShiftChange: (val: number) => void;
  containerWidth: number;
  onContainerWidthChange: (val: number) => void;
  containerHeight: number;
  onContainerHeightChange: (val: number) => void;
  rms: number;
  colors: string[];
  selectedColor: string;
  onColorChange: string | any;
  numWaves: number;
  onNumWavesChange: (val: number) => void;
  barWidth: number;
  onBarWidthChange: (val: number) => void;
  barSpacing: number;
  onBarSpacingChange: (val: number) => void;
  barAmplitude: number;
  onBarAmplitudeChange: (val: number) => void;
  sinoAmplitude: number;
  onSinoAmplitudeChange: (val: number) => void;
  sinoWavelength: number;
  onSinoWavelengthChange: (val: number) => void;
  sinoSpeed: number;
  onSinoSpeedChange: (val: number) => void;
  springStrands: number;
  onSpringStrandsChange: (val: number) => void;
  springAmplitude: number;
  onSpringAmplitudeChange: (val: number) => void;
  envelopeAmplitude: number;
  onEnvelopeAmplitudeChange: (val: number) => void;
  envelopeSpeed: number;
  onEnvelopeSpeedChange: (val: number) => void;
  envelopePoints: number;
  onEnvelopePointsChange: (val: number) => void;
  envelopeFillOpacity: number;
  onEnvelopeFillOpacityChange: (val: number) => void;
  waveAmplitude: number;
  onWaveAmplitudeChange: (val: number) => void;
  waveNoise: number;
  onWaveNoiseChange: (val: number) => void;
  paperAmount: number;
  onPaperAmountChange: (val: number) => void;
  paperWaves: number;
  onPaperWavesChange: (val: number) => void;
  paperPoints: number;
  onPaperPointsChange: (val: number) => void;
  paperIdleAmplitude: number;
  onPaperIdleAmplitudeChange: (val: number) => void;
  showPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenExport: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  theme, onThemeChange,
  isListening, isSimulated, onToggleListening, mode, onModeChange, sensitivity, onSensitivityChange,
  verticalShift, onVerticalShiftChange, containerWidth, onContainerWidthChange, 
  containerHeight, onContainerHeightChange,
  rms,
  colors, selectedColor, onColorChange, numWaves, onNumWavesChange, barWidth, onBarWidthChange,
  barSpacing, onBarSpacingChange, barAmplitude, onBarAmplitudeChange,
  sinoAmplitude, onSinoAmplitudeChange, sinoWavelength, 
  onSinoWavelengthChange, sinoSpeed, onSinoSpeedChange, springStrands, onSpringStrandsChange,
  springAmplitude, onSpringAmplitudeChange, envelopeAmplitude, onEnvelopeAmplitudeChange,
  envelopeSpeed, onEnvelopeSpeedChange, envelopePoints, onEnvelopePointsChange,
  envelopeFillOpacity, onEnvelopeFillOpacityChange,
  waveAmplitude, onWaveAmplitudeChange,
  waveNoise, onWaveNoiseChange,
  paperAmount, onPaperAmountChange,
  paperWaves, onPaperWavesChange,
  paperPoints, onPaperPointsChange,
  paperIdleAmplitude, onPaperIdleAmplitudeChange,
  showPhoneFrame, onTogglePhoneFrame, onOpenExport
}) => {
  const isDark = theme === 'dark';
  const subTextColor = isDark ? 'text-white/40' : 'text-gray-500';
  const inputBg = isDark ? 'bg-white/10' : 'bg-black/5';
  const borderColor = isDark ? 'border-white/5' : 'border-black/5';
  const activeBtnBg = isDark ? 'bg-white/20' : 'bg-black/10';
  const iconColor = isDark ? 'text-white' : 'text-gray-900';
  const iconDim = isDark ? 'text-white/40' : 'text-gray-400';

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className={`backdrop-blur-xl border rounded-2xl px-6 py-4 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto transition-colors duration-300 ${
        isDark ? 'bg-black/60 border-white/10' : 'bg-white/60 border-black/10 shadow-black/5'
      }`}>
        
        {/* ROW 1: Audio Input (Left) + Theme Toggle (Right) */}
        <div className={`flex items-center justify-between pb-4 border-b ${borderColor}`}>
          {/* Audio Input Component */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleListening}
              className={`p-3 rounded-full transition-all duration-300 relative group ${
                isListening 
                  ? isSimulated 
                    ? 'bg-yellow-500/20 text-yellow-600 ring-2 ring-yellow-500/50' 
                    : 'bg-red-500/20 text-red-600 ring-2 ring-red-500/50' 
                  : isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-gray-800 hover:bg-black/10'
              }`}
            >
              {isListening ? (isSimulated ? <AlertTriangle size={20} /> : <MicOff size={20} />) : <Mic size={20} />}
              {isSimulated && isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
            </button>
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                {isListening ? (isSimulated ? 'Simulated Audio' : 'Microphone Active') : 'Audio Input Off'}
              </span>
              <div className={`flex items-center gap-2 text-xs ${subTextColor}`}>
                 RMS Level: {(rms * 100).toFixed(1)}%
                 <div className={`w-16 h-1 rounded-full overflow-hidden ${inputBg}`}>
                    <div className={`h-full transition-all duration-75 ${isDark ? 'bg-white' : 'bg-gray-800'}`} style={{ width: `${Math.min(100, rms * 500)}%` }} />
                 </div>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className={`flex items-center p-1 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/50 border border-black/5'}`}>
             <button 
                onClick={() => onThemeChange('light')} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${!isDark ? 'bg-white shadow-sm text-black' : 'text-white/40 hover:text-white'}`}
                title="Light Mode"
             >
                <Sun size={14} />
                <span className="text-xs font-medium">Light</span>
             </button>
             <button 
                onClick={() => onThemeChange('dark')} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${isDark ? 'bg-gray-800 shadow-sm text-white' : 'text-black/40 hover:text-black'}`}
                title="Dark Mode"
             >
                <Moon size={14} />
                <span className="text-xs font-medium">Dark</span>
             </button>
          </div>
        </div>

        {/* ROW 2: Wave Style Label + Visualizer Modes */}
        <div className={`flex items-center gap-3 pb-4 pt-4 border-b ${borderColor}`}>
           <span className={`text-[10px] font-bold uppercase tracking-widest ${subTextColor} shrink-0`}>Wave Style</span>
           
           <div className={`flex items-center gap-2 p-1 rounded-lg ${isDark ? 'bg-black/20' : 'bg-black/5'}`}>
            <button onClick={() => onModeChange(VisualizerMode.PAPER_BAND)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.PAPER_BAND ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Paper Band"><Origami size={20} /></button>
            <button onClick={() => onModeChange(VisualizerMode.ENVELOPE)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.ENVELOPE ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Envelope Mode"><Activity size={20} /></button>
            <button onClick={() => onModeChange(VisualizerMode.SINO)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.SINO ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Sino Mode"><Spline size={20} /></button>
            <button onClick={() => onModeChange(VisualizerMode.SPRING_BAND)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.SPRING_BAND ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Spring Band"><Layers size={20} /></button>
            <button onClick={() => onModeChange(VisualizerMode.WAVE)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.WAVE ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Wave Mode"><Waves size={20} /></button>
            <button onClick={() => onModeChange(VisualizerMode.BARS)} className={`p-2 rounded-md transition-all ${mode === VisualizerMode.BARS ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Bars Mode"><BarChart2 size={20} /></button>
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            <button onClick={onTogglePhoneFrame} className={`p-2 rounded-md transition-all ${showPhoneFrame ? activeBtnBg + ' ' + iconColor : iconDim}`} title="Toggle Frame">{showPhoneFrame ? <Eye size={20} /> : <EyeOff size={20} />}</button>
          </div>
        </div>

        {/* ROW 3: Global Controls */}
        <div className={`flex flex-row gap-4 pt-4 border-t ${borderColor} items-center`}>
             <div className="flex items-center gap-2 flex-1">
                <Settings2 size={14} className={`${subTextColor} shrink-0`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider w-6 shrink-0 ${subTextColor}`}>SENS</span>
                <input type="range" min="1" max="20" step="0.5" value={sensitivity} onChange={(e) => onSensitivityChange(parseFloat(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-[10px] w-6 text-right font-mono ${subTextColor}`}>{sensitivity.toFixed(1)}</span>
             </div>
             <div className="flex items-center gap-2 flex-1">
                <MoveHorizontal size={14} className={`${subTextColor} shrink-0`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider w-8 shrink-0 ${subTextColor}`}>WIDTH</span>
                <input type="range" min="300" max="620" value={containerWidth} onChange={(e) => onContainerWidthChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-[10px] w-8 text-right font-mono ${subTextColor}`}>{containerWidth}</span>
             </div>
             <div className="flex items-center gap-2 flex-1">
                <MoveVertical size={14} className={`${subTextColor} shrink-0`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider w-10 shrink-0 ${subTextColor}`}>HEIGHT</span>
                <input type="range" min="40" max="800" value={containerHeight} onChange={(e) => onContainerHeightChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-[10px] w-8 text-right font-mono ${subTextColor}`}>{containerHeight}</span>
             </div>
        </div>

        {mode === VisualizerMode.PAPER_BAND && (
          <div className={`grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t ${borderColor}`}>
             <div className="flex items-center gap-4">
                <Layers size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Waves</span>
                <input type="range" min="1" max="4" step="1" value={paperWaves} onChange={(e) => onPaperWavesChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-4 text-right ${subTextColor}`}>{paperWaves}</span>
             </div>
             <div className="flex items-center gap-4">
                <Waypoints size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Points</span>
                <input type="range" min="4" max="80" step="1" value={paperPoints} onChange={(e) => onPaperPointsChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-6 text-right ${subTextColor}`}>{paperPoints}</span>
             </div>
             <div className="flex items-center gap-4">
                <Hash size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Bands</span>
                <input type="range" min="2" max="40" step="1" value={paperAmount} onChange={(e) => onPaperAmountChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-4 text-right ${subTextColor}`}>{paperAmount}</span>
             </div>
             <div className="flex items-center gap-4">
                <Moon size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Idle</span>
                <input type="range" min="-30" max="5" step="0.1" value={paperIdleAmplitude} onChange={(e) => onPaperIdleAmplitudeChange(parseFloat(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-6 text-right font-mono ${subTextColor}`}>{paperIdleAmplitude.toFixed(1)}</span>
             </div>
          </div>
        )}

        {mode === VisualizerMode.ENVELOPE && (
          <div className={`flex flex-col gap-4 pt-4 border-t ${borderColor}`}>
             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
               <div className="flex items-center gap-4">
                  <Sliders size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Amp</span>
                  <input type="range" min="10" max="160" value={envelopeAmplitude} onChange={(e) => onEnvelopeAmplitudeChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{envelopeAmplitude}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Hash size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Points</span>
                  <input type="range" min="2" max="60" step="1" value={envelopePoints} onChange={(e) => onEnvelopePointsChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{envelopePoints}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Zap size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Speed</span>
                  <input type="range" min="0" max="0.2" step="0.01" value={envelopeSpeed} onChange={(e) => onEnvelopeSpeedChange(parseFloat(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{envelopeSpeed.toFixed(2)}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Droplets size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Opacity</span>
                  <input type="range" min="0" max="100" step="1" value={envelopeFillOpacity} onChange={(e) => onEnvelopeFillOpacityChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{envelopeFillOpacity}%</span>
               </div>
             </div>
          </div>
        )}

        {mode === VisualizerMode.SINO && (
          <div className={`flex flex-col gap-4 pt-4 border-t ${borderColor}`}>
             <div className="flex items-center gap-4">
                <Zap size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-24 shrink-0 ${subTextColor}`}>Speed</span>
                <input type="range" min="0" max="5" step="0.1" value={sinoSpeed} onChange={(e) => onSinoSpeedChange(parseFloat(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-10 text-right ${subTextColor}`}>{sinoSpeed.toFixed(1)}</span>
             </div>
             <div className="flex items-center gap-4">
                <Sliders size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-24 shrink-0 ${subTextColor}`}>Amplitude</span>
                <input type="range" min="10" max="200" step="1" value={sinoAmplitude} onChange={(e) => onSinoAmplitudeChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-10 text-right ${subTextColor}`}>{sinoAmplitude}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Waves size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-24 shrink-0 ${subTextColor}`}>Wavelength</span>
                <input type="range" min="2" max="500" step="1" value={sinoWavelength} onChange={(e) => onSinoWavelengthChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-10 text-right ${subTextColor}`}>{sinoWavelength}px</span>
             </div>
          </div>
        )}

        {mode === VisualizerMode.WAVE && (
          <div className={`flex flex-col gap-4 pt-4 border-t ${borderColor}`}>
             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
               <div className="flex items-center gap-4">
                  <Sliders size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Amp</span>
                  <input type="range" min="10" max="400" step="1" value={waveAmplitude} onChange={(e) => onWaveAmplitudeChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{waveAmplitude}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Volume2 size={16} className={`${subTextColor} shrink-0`} />
                  <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Noise</span>
                  <input type="range" min="0" max="100" step="1" value={waveNoise} onChange={(e) => onWaveNoiseChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                  <span className={`text-xs w-8 text-right font-mono ${subTextColor}`}>{waveNoise}</span>
               </div>
             </div>
          </div>
        )}

        {mode === VisualizerMode.BARS && (
          <div className={`grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t ${borderColor}`}>
             <div className="flex items-center gap-4">
                <Waves size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Waves</span>
                <input type="range" min="3" max="20" step="1" value={numWaves} onChange={(e) => onNumWavesChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-6 text-right ${subTextColor}`}>{numWaves}</span>
             </div>
             <div className="flex items-center gap-4">
                <MoveHorizontal size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Weight</span>
                <input type="range" min="2" max="150" step="1" value={barWidth} onChange={(e) => onBarWidthChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-10 text-right font-mono ${subTextColor}`}>{barWidth}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Hash size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Spacing</span>
                <input type="range" min="2" max="40" step="1" value={barSpacing} onChange={(e) => onBarSpacingChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-6 text-right ${subTextColor}`}>{barSpacing}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Sliders size={16} className={`${subTextColor} shrink-0`} />
                <span className={`text-xs font-medium uppercase tracking-wider w-16 shrink-0 ${subTextColor}`}>Amplitude</span>
                <input type="range" min="2" max="140" step="1" value={barAmplitude} onChange={(e) => onBarAmplitudeChange(parseInt(e.target.value))} className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${inputBg}`} />
                <span className={`text-xs w-6 text-right ${subTextColor}`}>{barAmplitude}px</span>
             </div>
          </div>
        )}

        <div className={`flex items-center justify-between pt-4 border-t ${borderColor} mt-auto`}>
          <div className="flex items-center gap-4">
            {mode !== VisualizerMode.SPRING_BAND && (
              <>
                <Palette size={16} className={subTextColor} />
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button 
                      key={c} 
                      onClick={() => onColorChange(c)} 
                      className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? (isDark ? 'border-white scale-110' : 'border-gray-800 scale-110') : 'border-transparent hover:scale-105'}`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          <button 
            onClick={onOpenExport} 
            className={`px-4 py-2 hover:bg-white hover:text-black rounded-xl transition-all flex items-center gap-2 group border ${isDark ? 'bg-white/10 border-white/5 text-white' : 'bg-black/5 border-black/5 text-gray-800'}`}
          >
            <Code2 size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Export Code</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Controls;