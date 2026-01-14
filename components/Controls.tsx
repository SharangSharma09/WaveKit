import React from 'react';
import { Mic, MicOff, Waves, BarChart2, Settings2, Sliders, Palette, MoveHorizontal, MoveVertical, Spline, Layers, Eye, EyeOff, Zap, Activity, Hash, Origami, Waypoints, Moon, Sun, Droplets, Volume2, Code2, AlertTriangle } from 'lucide-react';
import { VisualizerMode, Theme } from '../types';
import CustomColorPicker from './CustomColorPicker';

interface ControlsProps {
  isListening: boolean;
  isSimulated: boolean;
  onToggleListening: () => void;
  mode: VisualizerMode;
  onModeChange: (mode: VisualizerMode) => void;
  theme: Theme;
  onThemeToggle: () => void;
  sensitivity: number;
  onSensitivityChange: (val: number) => void;
  verticalShift: number;
  onVerticalShiftChange: (val: number) => void;
  containerWidth: number;
  onContainerWidthChange: (val: number) => void;
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
  isListening, isSimulated, onToggleListening, mode, onModeChange, theme, onThemeToggle, sensitivity, onSensitivityChange,
  verticalShift, onVerticalShiftChange, containerWidth, onContainerWidthChange, rms,
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
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[672px]">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
        
        {/* Row 1: Input Status, Frame Toggle and Theme Slider */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleListening}
              className={`p-4 rounded-full transition-all duration-300 relative group ${
                isListening 
                  ? isSimulated 
                    ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-500/50' 
                    : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isListening ? (isSimulated ? <AlertTriangle size={24} /> : <MicOff size={24} />) : <Mic size={24} />}
              {isSimulated && isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white/90">
                {isListening ? (isSimulated ? 'Simulated Audio' : 'Microphone Active') : 'Audio Input Off'}
              </span>
              <div className="flex items-center gap-2 text-xs text-white/50">
                 RMS Level: {(rms * 100).toFixed(1)}%
                 <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-75 bg-white" style={{ width: `${Math.min(100, rms * 500)}%` }} />
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Phone Frame Toggle moved here */}
            <button 
              onClick={onTogglePhoneFrame} 
              className={`p-2.5 rounded-xl transition-all border border-white/5 ${showPhoneFrame ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`} 
              title="Toggle Phone Frame"
            >
              {showPhoneFrame ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>

            {/* Sliding Toggle for Theme */}
            <div 
              onClick={onThemeToggle}
              className="group flex items-center bg-white/10 p-1 rounded-full w-14 h-8 relative cursor-pointer border border-white/5 hover:bg-white/20 transition-all shadow-inner"
              title={`Switch to ${theme === Theme.DARK ? 'Light' : 'Dark'} Mode`}
            >
              <div 
                className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-md ${
                  theme === Theme.DARK ? 'translate-x-6 bg-indigo-500' : 'translate-x-0 bg-yellow-400'
                }`}
              >
                {theme === Theme.DARK ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-black" />}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Visualization Mode Selector */}
        <div className="flex items-center justify-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
          <button onClick={() => onModeChange(VisualizerMode.PAPER_BAND)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.PAPER_BAND ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Paper Band">
            <Origami size={18} />
          </button>
          <button onClick={() => onModeChange(VisualizerMode.ENVELOPE)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.ENVELOPE ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Envelope Mode">
            <Activity size={18} />
          </button>
          <button onClick={() => onModeChange(VisualizerMode.SINO)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.SINO ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Sino Mode">
            <Spline size={18} />
          </button>
          <button onClick={() => onModeChange(VisualizerMode.SPRING_BAND)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.SPRING_BAND ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Spring Band">
            <Layers size={18} />
          </button>
          <button onClick={() => onModeChange(VisualizerMode.WAVE)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.WAVE ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Wave Mode">
            <Waves size={18} />
          </button>
          <button onClick={() => onModeChange(VisualizerMode.BARS)} className={`p-2.5 px-4 rounded-lg transition-all flex items-center gap-2 ${mode === VisualizerMode.BARS ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/60'}`} title="Bars Mode">
            <BarChart2 size={18} />
          </button>
        </div>

        {/* Global Sliders Row */}
        <div className="flex flex-row gap-4 pt-4 border-t border-white/5 items-center">
             <div className="flex items-center gap-2 flex-1">
                <Settings2 size={14} className="text-white/40 shrink-0" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider w-6 shrink-0">SENS</span>
                <input type="range" min="0.1" max="2.0" step="0.1" value={sensitivity} onChange={(e) => onSensitivityChange(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-[10px] text-white/40 w-6 text-right font-mono">{sensitivity.toFixed(1)}</span>
             </div>
             <div className="flex items-center gap-2 flex-1">
                <MoveHorizontal size={14} className="text-white/40 shrink-0" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider w-8 shrink-0">WIDTH</span>
                <input type="range" min="400" max="1000" value={containerWidth} onChange={(e) => onContainerWidthChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-[10px] text-white/40 w-8 text-right font-mono">{containerWidth}</span>
             </div>
             <div className="flex items-center gap-2 flex-1">
                <MoveVertical size={14} className="text-white/40 shrink-0" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider w-8 shrink-0">POS Y</span>
                <input type="range" min="-50" max="50" value={verticalShift} onChange={(e) => onVerticalShiftChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-[10px] text-white/40 w-8 text-right font-mono">{verticalShift}</span>
             </div>
        </div>

        {/* Mode Specific Controls */}
        {mode === VisualizerMode.PAPER_BAND && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-4">
                <Layers size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Waves</span>
                <input type="range" min="1" max="4" step="1" value={paperWaves} onChange={(e) => onPaperWavesChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-4 text-right">{paperWaves}</span>
             </div>
             <div className="flex items-center gap-4">
                <Waypoints size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Points</span>
                <input type="range" min="4" max="80" step="1" value={paperPoints} onChange={(e) => onPaperPointsChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-6 text-right">{paperPoints}</span>
             </div>
             <div className="flex items-center gap-4">
                <Hash size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Bands</span>
                <input type="range" min="2" max="40" step="1" value={paperAmount} onChange={(e) => onPaperAmountChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-4 text-right">{paperAmount}</span>
             </div>
             <div className="flex items-center gap-4">
                <Moon size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Idle</span>
                <input type="range" min="-30" max="5" step="0.1" value={paperIdleAmplitude} onChange={(e) => onPaperIdleAmplitudeChange(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-6 text-right font-mono">{paperIdleAmplitude.toFixed(1)}</span>
             </div>
          </div>
        )}

        {mode === VisualizerMode.ENVELOPE && (
          <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
             <div className="grid grid-cols-2 gap-x-8 gap-y-4">
               <div className="flex items-center gap-4">
                  <Sliders size={16} className="text-white/40 shrink-0" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Amp</span>
                  <input type="range" min="10" max="160" value={envelopeAmplitude} onChange={(e) => onEnvelopeAmplitudeChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  <span className="text-xs text-white/40 w-8 text-right font-mono">{envelopeAmplitude}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Hash size={16} className="text-white/40 shrink-0" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Points</span>
                  <input type="range" min="2" max="60" step="1" value={envelopePoints} onChange={(e) => onEnvelopePointsChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  <span className="text-xs text-white/40 w-8 text-right font-mono">{envelopePoints}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Zap size={16} className="text-white/40 shrink-0" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Speed</span>
                  <input type="range" min="0" max="0.2" step="0.01" value={envelopeSpeed} onChange={(e) => onEnvelopeSpeedChange(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  <span className="text-xs text-white/40 w-8 text-right font-mono">{envelopeSpeed.toFixed(2)}</span>
               </div>
               <div className="flex items-center gap-4">
                  <Droplets size={16} className="text-white/40 shrink-0" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Opacity</span>
                  <input type="range" min="0" max="100" step="1" value={envelopeFillOpacity} onChange={(e) => onEnvelopeFillOpacityChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  <span className="text-xs text-white/40 w-8 text-right font-mono">{envelopeFillOpacity}%</span>
               </div>
             </div>
          </div>
        )}

        {mode === VisualizerMode.SINO && (
          <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-4">
                <Zap size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-24 shrink-0">Speed</span>
                <input type="range" min="0" max="5" step="0.1" value={sinoSpeed} onChange={(e) => onSinoSpeedChange(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-10 text-right">{sinoSpeed.toFixed(1)}</span>
             </div>
             <div className="flex items-center gap-4">
                <Sliders size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-24 shrink-0">Amplitude</span>
                <input type="range" min="10" max="200" step="1" value={sinoAmplitude} onChange={(e) => onSinoAmplitudeChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-10 text-right">{sinoAmplitude}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Waves size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-24 shrink-0">Wavelength</span>
                <input type="range" min="2" max="500" step="1" value={sinoWavelength} onChange={(e) => onSinoWavelengthChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-10 text-right">{sinoWavelength}px</span>
             </div>
          </div>
        )}

        {mode === VisualizerMode.WAVE && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-4">
                <Sliders size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Amp</span>
                <input type="range" min="10" max="400" step="1" value={waveAmplitude} onChange={(e) => onWaveAmplitudeChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-8 text-right font-mono">{waveAmplitude}</span>
             </div>
             <div className="flex items-center gap-4">
                <Volume2 size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Noise</span>
                <input type="range" min="0" max="100" step="1" value={waveNoise} onChange={(e) => onWaveNoiseChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-8 text-right font-mono">{waveNoise}</span>
             </div>
          </div>
        )}

        {mode === VisualizerMode.BARS && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-4">
                <Waves size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Waves</span>
                <input type="range" min="3" max="20" step="1" value={numWaves} onChange={(e) => onNumWavesChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-6 text-right">{numWaves}</span>
             </div>
             <div className="flex items-center gap-4">
                <MoveHorizontal size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Weight</span>
                <input type="range" min="2" max="150" step="1" value={barWidth} onChange={(e) => onBarWidthChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-10 text-right font-mono">{barWidth}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Hash size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Spacing</span>
                <input type="range" min="2" max="40" step="1" value={barSpacing} onChange={(e) => onBarSpacingChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-6 text-right">{barSpacing}px</span>
             </div>
             <div className="flex items-center gap-4">
                <Sliders size={16} className="text-white/40 shrink-0" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider w-16 shrink-0">Amplitude</span>
                <input type="range" min="2" max="140" step="1" value={barAmplitude} onChange={(e) => onBarAmplitudeChange(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                <span className="text-xs text-white/40 w-6 text-right">{barAmplitude}px</span>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-4">
            {mode !== VisualizerMode.SPRING_BAND && (
              <>
                <Palette size={16} className="text-white/40" />
                <div className="flex gap-3 items-center">
                  {colors.map((c) => (
                    <button 
                      key={c} 
                      onClick={() => onColorChange(c)} 
                      className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                  {/* Custom Color Picker */}
                  <CustomColorPicker color={selectedColor} onChange={onColorChange} />
                </div>
              </>
            )}
          </div>
          <button 
            onClick={onOpenExport} 
            className="px-4 py-2 bg-white/10 hover:bg-white hover:text-black rounded-xl transition-all flex items-center gap-2 group border border-white/5"
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