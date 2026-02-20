import React from 'react';
import { Mic, MicOff, Waves, BarChart2, Settings2, Sliders, Palette, MoveHorizontal, MoveVertical, Spline, Layers, Eye, EyeOff, Zap, Activity, Hash, Origami, Waypoints, Moon, Sun, Droplets, Volume2, Code2, AlertTriangle, Power, ArrowRight, Move } from 'lucide-react';
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
  onColorChange: (color: string) => void;
  numWaves: number;
  onNumWavesChange: (val: number) => void;
  barWidth: number;
  onBarWidthChange: (val: number) => void;
  barHeight?: number;
  onBarHeightChange?: (val: number) => void;
  barSpacing: number;
  onBarSpacingChange: (val: number) => void;
  barAmplitude: number;
  onBarAmplitudeChange: (val: number) => void;
  barRoundness?: number;
  onBarRoundnessChange?: (val: number) => void;
  barMoving?: boolean;
  onBarMovingChange?: (val: boolean) => void;
  barSpeed?: number;
  onBarSpeedChange?: (val: number) => void;
  sinoAmplitude: number;
  onSinoAmplitudeChange: (val: number) => void;
  sinoWavelength: number;
  onSinoWavelengthChange: (val: number) => void;
  sinoSpeed: number;
  onSinoSpeedChange: (val: number) => void;
  sinoMoving?: boolean;
  onSinoMovingChange?: (val: boolean) => void;
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
  envelopeStrokeWidth?: number;
  onEnvelopeStrokeWidthChange?: (val: number) => void;
  envelopeMoving?: boolean;
  onEnvelopeMovingChange?: (val: boolean) => void;
  waveAmplitude: number;
  onWaveAmplitudeChange: (val: number) => void;
  waveNoise: number;
  onWaveNoiseChange: (val: number) => void;
  waveSpeed?: number;
  onWaveSpeedChange?: (val: number) => void;
  waveMoving?: boolean;
  onWaveMovingChange?: (val: boolean) => void;
  paperAmount: number;
  onPaperAmountChange: (val: number) => void;
  paperWaves: number;
  onPaperWavesChange: (val: number) => void;
  paperPoints: number;
  onPaperPointsChange: (val: number) => void;
  paperIdleAmplitude: number;
  onPaperIdleAmplitudeChange: (val: number) => void;
  paperStrokeWidth: number;
  onPaperStrokeWidthChange: (val: number) => void;
  paperWaveColors: string[];
  onPaperWaveColorChange: (index: number, color: string) => void;
  paperMoving?: boolean;
  onPaperMovingChange?: (val: boolean) => void;
  paperSpeed?: number;
  onPaperSpeedChange?: (val: number) => void;
  showPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenExport: () => void;
  title?: string;
}

const ControlKnobLike = ({ label, value, onChange, min, max, step, suffix = '' }: any) => (
  <div className="flex flex-col gap-1 min-w-[120px] flex-1">
    <div className="flex items-center justify-between">
       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
       <span className="text-[9px] font-mono text-zinc-400">{typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{suffix}</span>
    </div>
    <div className="h-5 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
       <input 
         type="range" 
         min={min} 
         max={max} 
         step={step} 
         value={value} 
         onChange={(e) => onChange(parseFloat(e.target.value))} 
         className="w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full"
       />
    </div>
  </div>
);

const Controls: React.FC<ControlsProps> = ({
  isListening, isSimulated, onToggleListening, mode, onModeChange, theme, onThemeToggle, sensitivity, onSensitivityChange,
  verticalShift, onVerticalShiftChange, containerWidth, onContainerWidthChange, rms,
  colors, selectedColor, onColorChange, numWaves, onNumWavesChange, barWidth, onBarWidthChange,
  barHeight = 50, onBarHeightChange = (_val: number) => {},
  barSpacing, onBarSpacingChange, barAmplitude, onBarAmplitudeChange,
  barRoundness = 100, onBarRoundnessChange = (_val: number) => {},
  barMoving = false, onBarMovingChange = (_val: boolean) => {},
  barSpeed = 1, onBarSpeedChange = (_val: number) => {},
  sinoAmplitude, onSinoAmplitudeChange, sinoWavelength, 
  onSinoWavelengthChange, sinoSpeed, onSinoSpeedChange, sinoMoving = false, onSinoMovingChange = (_val: boolean) => {},
  springStrands, onSpringStrandsChange,
  springAmplitude, onSpringAmplitudeChange, envelopeAmplitude, onEnvelopeAmplitudeChange,
  envelopeSpeed, onEnvelopeSpeedChange, envelopePoints, onEnvelopePointsChange,
  envelopeFillOpacity, onEnvelopeFillOpacityChange,
  envelopeStrokeWidth = 4, onEnvelopeStrokeWidthChange = (_val: number) => {},
  envelopeMoving = false, onEnvelopeMovingChange = (_val: boolean) => {},
  waveAmplitude, onWaveAmplitudeChange,
  waveNoise, onWaveNoiseChange,
  waveSpeed = 1, onWaveSpeedChange = (_val: number) => {},
  waveMoving = true, onWaveMovingChange = (_val: boolean) => {},
  paperAmount, onPaperAmountChange,
  paperWaves, onPaperWavesChange,
  paperPoints, onPaperPointsChange,
  paperIdleAmplitude, onPaperIdleAmplitudeChange,
  paperStrokeWidth, onPaperStrokeWidthChange,
  paperWaveColors, onPaperWaveColorChange,
  paperMoving = false, onPaperMovingChange = (_val: boolean) => {},
  paperSpeed = 2, onPaperSpeedChange = (_val: number) => {},
  showPhoneFrame, onTogglePhoneFrame, onOpenExport,
  title
}) => {
  const [showPositionMenu, setShowPositionMenu] = React.useState(false);
  const positionMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (positionMenuRef.current && !positionMenuRef.current.contains(event.target as Node)) {
        setShowPositionMenu(false);
      }
    };
    if (showPositionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPositionMenu]);

  return (
    <div className="relative w-full h-auto flex flex-col items-center p-2">
      
      {/* Page Title Placeholder */}
      {title && (
        <h1 className="text-center text-white/50 text-xl 2xl:text-2xl font-bold mb-3 tracking-widest uppercase font-mono selection:bg-emerald-500/30 selection:text-emerald-200 transition-all shrink-0">
            {title}
        </h1>
      )}

      {/* Hardware Chassis - Fully rounded for detached floating effect */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-[24px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/5 relative w-full">
        {/* Shine effect on top edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></div>

        {/* --- Top Deck: Transport & Global Status --- */}
        <div className="bg-[#202023] p-3 3xl:p-4 flex items-center justify-between border-b border-black/40 shadow-sm relative z-10 shrink-0">
          <div className="flex items-center gap-4 3xl:gap-6">
            {/* Main Power/Mic Button */}
            <div className="relative">
              <button
                onClick={onToggleListening}
                className={`w-12 h-12 3xl:w-14 3xl:h-14 rounded-full flex items-center justify-center border-2 shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] active:scale-95 active:shadow-inner transition-all duration-100 ${
                  isListening 
                    ? 'bg-[#1c1c1f] border-zinc-700' 
                    : 'bg-[#27272a] border-zinc-600 hover:bg-[#303034]'
                }`}
              >
                <Power size={18} className={`3xl:w-5 3xl:h-5 ${isListening ? 'text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-zinc-500'}`} />
              </button>
              {/* LED Indicator Dot */}
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#18181b] ${isListening ? (isSimulated ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]') : 'bg-zinc-800'}`}></div>
            </div>

            {/* LCD Info Screen */}
            <div className="h-12 3xl:h-14 bg-[#09090b] border border-[#333] rounded-md p-2 px-3 flex flex-col justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] min-w-[160px] 3xl:min-w-[180px]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Status</span>
                <span className={`text-[9px] font-mono uppercase ${isListening ? (isSimulated ? 'text-amber-500' : 'text-emerald-500') : 'text-zinc-600'}`}>
                  {isListening ? (isSimulated ? 'SIMULATED' : 'LIVE INPUT') : 'STANDBY'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest w-6">RMS</span>
                 <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-sm overflow-hidden flex gap-[1px]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-[1px] transition-colors duration-75 ${
                          (rms * 100) / 5 > i 
                            ? i > 16 ? 'bg-red-500' : i > 12 ? 'bg-amber-500' : 'bg-emerald-500'
                            : 'bg-[#222]'
                        }`} 
                      />
                    ))}
                 </div>
              </div>
            </div>
          </div>
          
          {/* SENSITIVITY SLIDER - Moved to Top Deck */}
          <div className="flex-1 max-w-[200px] 3xl:max-w-[240px] px-4">
             <ControlKnobLike label="SENS" value={sensitivity} onChange={onSensitivityChange} min={0.1} max={4.0} step={0.1} />
          </div>
          
          {/* Utility Buttons */}
          <div className="flex items-center gap-2">
             {/* Position Menu Button */}
             <div className="relative" ref={positionMenuRef}>
                <button 
                  onClick={() => setShowPositionMenu(!showPositionMenu)} 
                  className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-[#323236] shadow-md active:translate-y-[1px] transition-all ${showPositionMenu ? 'border-emerald-500/30 text-emerald-400 bg-[#323236]' : ''}`}
                  title="Canvas Position"
                >
                  <Move size={14} className="3xl:w-4 3xl:h-4" />
                </button>
                {showPositionMenu && (
                  <div className="absolute top-full right-0 mt-2 p-3 bg-[#1A1D27] border border-white/10 rounded-xl shadow-2xl z-50 w-[180px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                      
                      {/* Container Width */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Width</span>
                        </div>
                        <div className="h-8 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center pr-1 overflow-hidden">
                           <div className="h-full w-8 bg-zinc-800 border-r border-zinc-700 flex items-center justify-center text-zinc-500">
                              <MoveHorizontal size={14} />
                           </div>
                           <input 
                              type="number" 
                              value={containerWidth} 
                              onChange={(e) => {
                                 const val = e.target.value.slice(0, 3);
                                 onContainerWidthChange(Number(val));
                              }} 
                              className="w-full bg-transparent text-right text-xs font-mono text-zinc-300 focus:outline-none px-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>
                     </div>

                     {/* Vertical Shift */}
                     <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Shift Y</span>
                           <span className="text-[9px] font-mono text-zinc-400">{verticalShift.toFixed(0)}</span>
                        </div>
                        <div className="h-6 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                           <input 
                              type="range" 
                              min={-20} 
                              max={20} 
                              step={1} 
                              value={verticalShift} 
                              onChange={(e) => onVerticalShiftChange(parseFloat(e.target.value))}
                              className="w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full"
                            />
                        </div>
                     </div>

                     {/* Arrow */}
                     <div className="absolute -top-1 right-3 w-2 h-2 bg-[#1A1D27] border-l border-t border-white/10 rotate-45"></div>
                  </div>
                )}
             </div>

             <button onClick={onTogglePhoneFrame} className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-[#323236] shadow-md active:translate-y-[1px] transition-all ${showPhoneFrame ? 'text-emerald-400 border-emerald-900/30' : ''}`}>
                {showPhoneFrame ? <Eye size={14} className="3xl:w-4 3xl:h-4" /> : <EyeOff size={14} className="3xl:w-4 3xl:h-4" />}
             </button>
             <button onClick={onThemeToggle} className="h-9 w-9 3xl:h-10 3xl:w-10 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-[#323236] shadow-md active:translate-y-[1px] transition-all">
                {theme === Theme.DARK ? <Moon size={14} className="3xl:w-4 3xl:h-4" /> : <Sun size={14} className="3xl:w-4 3xl:h-4" />}
             </button>
             <button onClick={onOpenExport} className="h-9 px-3 3xl:h-10 3xl:px-4 rounded bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-[#323236] shadow-md active:translate-y-[1px] transition-all gap-2">
                <Code2 size={14} className="3xl:w-4 3xl:h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Export</span>
             </button>
          </div>
        </div>

        {/* --- Mode Selector Deck --- */}
        <div className="bg-[#18181b] p-1 border-b border-black/40 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: VisualizerMode.PAPER_BAND, icon: Origami, label: 'Paper' },
              { id: VisualizerMode.ENVELOPE, icon: Activity, label: 'Envelope' },
              { id: VisualizerMode.SINO, icon: Spline, label: 'Sino' },
              { id: VisualizerMode.WAVE, icon: Waves, label: 'Wave' },
              { id: VisualizerMode.BARS, icon: BarChart2, label: 'Bars' },
            ].map((m) => (
              <button 
                key={m.id}
                onClick={() => onModeChange(m.id)} 
                className={`flex-1 min-w-[70px] py-2 rounded flex flex-col items-center gap-1 border transition-all duration-100 ${
                  mode === m.id 
                    ? 'bg-[#1c1c1f] border-zinc-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] text-emerald-400' 
                    : 'bg-[#222225] border-transparent text-zinc-500 hover:bg-[#2a2a2d] hover:text-zinc-300'
                }`}
                title={m.label}
              >
                <m.icon size={14} className="3xl:w-5 3xl:h-5" strokeWidth={mode === m.id ? 2.5 : 2} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${mode === m.id ? 'text-emerald-500/80' : 'text-zinc-600'}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* --- Main Controls Deck --- */}
        <div className="p-4 3xl:p-6 bg-[#18181b] flex flex-col gap-4 3xl:gap-6 shrink-0 overflow-y-visible">
            
            {/* Mode Specific Controls */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 3xl:gap-x-8 3xl:gap-y-6">
                {mode === VisualizerMode.PAPER_BAND && (
                  <>
                    <ControlKnobLike label="Waves" value={paperWaves} onChange={onPaperWavesChange} min={1} max={5} step={1} />
                    <ControlKnobLike label="Packing" value={paperPoints} onChange={onPaperPointsChange} min={4} max={80} step={1} />
                    <ControlKnobLike label="Smoothing" value={paperAmount} onChange={onPaperAmountChange} min={2} max={40} step={1} />
                    <ControlKnobLike label="Amplitude" value={paperIdleAmplitude} onChange={onPaperIdleAmplitudeChange} min={-30} max={5} step={0.1} />
                    <ControlKnobLike label="Stroke" value={paperStrokeWidth} onChange={onPaperStrokeWidthChange} min={4} max={12} step={1} suffix="px" />
                    
                    {/* Movement Control Unit */}
                    <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Movement</span>
                          <span className="text-[9px] font-mono text-zinc-400">{paperMoving ? paperSpeed.toFixed(1) : 'OFF'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Toggle */}
                           <button 
                             onClick={() => {
                               if (!paperMoving) onPaperSpeedChange(1);
                               onPaperMovingChange(!paperMoving);
                             }}
                             className={`h-5 w-8 rounded border border-zinc-800 shadow-inner flex items-center justify-center transition-all ${paperMoving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                             title="Toggle Movement"
                           >
                              <ArrowRight size={12} className={paperMoving ? "animate-pulse" : ""} />
                           </button>
                           
                           {/* Speed Slider */}
                           <div className="h-5 flex-1 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                              <input 
                                type="range" 
                                min={0} 
                                max={3} 
                                step={0.1} 
                                value={paperSpeed} 
                                onChange={(e) => onPaperSpeedChange(parseFloat(e.target.value))} 
                                disabled={!paperMoving}
                                className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full ${!paperMoving ? 'opacity-30 pointer-events-none' : ''}`}
                              />
                           </div>
                        </div>
                    </div>
                  </>
                )}

                {mode === VisualizerMode.ENVELOPE && (
                  <>
                     <ControlKnobLike label="Amp" value={envelopeAmplitude} onChange={onEnvelopeAmplitudeChange} min={10} max={160} step={1} />
                     <ControlKnobLike label="Points" value={envelopePoints} onChange={onEnvelopePointsChange} min={2} max={60} step={1} />
                     <ControlKnobLike label="Opacity" value={envelopeFillOpacity} onChange={onEnvelopeFillOpacityChange} min={0} max={100} step={1} suffix="%" />
                     <ControlKnobLike label="Stroke" value={envelopeStrokeWidth} onChange={onEnvelopeStrokeWidthChange} min={0} max={12} step={1} suffix="px" />
                     
                     {/* Movement Control Unit for Envelope */}
                     <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Movement</span>
                          <span className="text-[9px] font-mono text-zinc-400">{envelopeMoving ? envelopeSpeed.toFixed(1) : 'OFF'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Toggle */}
                           <button 
                             onClick={() => {
                               if (!envelopeMoving) onEnvelopeSpeedChange(1);
                               onEnvelopeMovingChange(!envelopeMoving);
                             }}
                             className={`h-5 w-8 rounded border border-zinc-800 shadow-inner flex items-center justify-center transition-all ${envelopeMoving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                             title="Toggle Movement"
                           >
                              <ArrowRight size={12} className={envelopeMoving ? "animate-pulse" : ""} />
                           </button>
                           
                           {/* Speed Slider */}
                           <div className="h-5 flex-1 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                              <input 
                                type="range" 
                                min={0} 
                                max={3} 
                                step={0.1} 
                                value={envelopeSpeed} 
                                onChange={(e) => onEnvelopeSpeedChange(parseFloat(e.target.value))} 
                                disabled={!envelopeMoving}
                                className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full ${!envelopeMoving ? 'opacity-30 pointer-events-none' : ''}`}
                              />
                           </div>
                        </div>
                    </div>
                  </>
                )}

                {mode === VisualizerMode.SINO && (
                  <>
                     <ControlKnobLike label="Amplitude" value={sinoAmplitude} onChange={onSinoAmplitudeChange} min={5} max={200} step={1} suffix="px" />
                     <ControlKnobLike label="Wavelength" value={sinoWavelength} onChange={onSinoWavelengthChange} min={2} max={500} step={1} suffix="px" />
                     
                     {/* Movement Control Unit for Sino */}
                     <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Movement</span>
                          <span className="text-[9px] font-mono text-zinc-400">{sinoMoving ? sinoSpeed.toFixed(1) : 'OFF'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Toggle */}
                           <button 
                             onClick={() => {
                               if (!sinoMoving) onSinoSpeedChange(1);
                               onSinoMovingChange(!sinoMoving);
                             }}
                             className={`h-5 w-8 rounded border border-zinc-800 shadow-inner flex items-center justify-center transition-all ${sinoMoving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                             title="Toggle Movement"
                           >
                              <ArrowRight size={12} className={sinoMoving ? "animate-pulse" : ""} />
                           </button>
                           
                           {/* Speed Slider */}
                           <div className="h-5 flex-1 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                              <input 
                                type="range" 
                                min={0} 
                                max={3} 
                                step={0.1} 
                                value={sinoSpeed} 
                                onChange={(e) => onSinoSpeedChange(parseFloat(e.target.value))} 
                                disabled={!sinoMoving}
                                className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full ${!sinoMoving ? 'opacity-30 pointer-events-none' : ''}`}
                              />
                           </div>
                        </div>
                    </div>
                  </>
                )}

                {mode === VisualizerMode.WAVE && (
                  <>
                     <ControlKnobLike label="Amp" value={waveAmplitude} onChange={onWaveAmplitudeChange} min={-150} max={150} step={1} />
                     <ControlKnobLike label="Noise" value={waveNoise} onChange={onWaveNoiseChange} min={0} max={100} step={1} />

                     {/* Movement Control Unit for Wave */}
                     <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Movement</span>
                          <span className="text-[9px] font-mono text-zinc-400">{waveMoving ? waveSpeed.toFixed(1) : 'OFF'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Toggle */}
                           <button 
                             onClick={() => {
                               if (!waveMoving) onWaveSpeedChange(1);
                               onWaveMovingChange(!waveMoving);
                             }}
                             className={`h-5 w-8 rounded border border-zinc-800 shadow-inner flex items-center justify-center transition-all ${waveMoving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                             title="Toggle Movement"
                           >
                              <ArrowRight size={12} className={waveMoving ? "animate-pulse" : ""} />
                           </button>
                           
                           {/* Speed Slider */}
                           <div className="h-5 flex-1 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                              <input 
                                type="range" 
                                min={0} 
                                max={3} 
                                step={0.1} 
                                value={waveSpeed} 
                                onChange={(e) => onWaveSpeedChange(parseFloat(e.target.value))} 
                                disabled={!waveMoving}
                                className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full ${!waveMoving ? 'opacity-30 pointer-events-none' : ''}`}
                              />
                           </div>
                        </div>
                    </div>
                  </>
                )}

                {mode === VisualizerMode.BARS && (
                  <>
                     <ControlKnobLike label="Waves" value={numWaves} onChange={onNumWavesChange} min={3} max={20} step={1} />
                     <ControlKnobLike label="Width" value={barWidth} onChange={onBarWidthChange} min={2} max={100} step={1} suffix="px" />
                     <ControlKnobLike label="Spacing" value={barSpacing} onChange={onBarSpacingChange} min={2} max={40} step={1} suffix="px" />
                     <ControlKnobLike label="Amplitude" value={barAmplitude} onChange={onBarAmplitudeChange} min={2} max={140} step={1} suffix="px" />
                     <ControlKnobLike label="Height" value={barHeight} onChange={onBarHeightChange} min={0} max={50} step={1} suffix="px" />
                     <ControlKnobLike label="Roundness" value={barRoundness} onChange={onBarRoundnessChange} min={0} max={100} step={1} suffix="%" />

                     {/* Movement Control Unit for Bars */}
                     <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Movement</span>
                          <span className="text-[9px] font-mono text-zinc-400">{barMoving ? barSpeed.toFixed(1) : 'OFF'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           {/* Toggle */}
                           <button 
                             onClick={() => {
                               if (!barMoving) onBarSpeedChange(1);
                               onBarMovingChange(!barMoving);
                             }}
                             className={`h-5 w-8 rounded border border-zinc-800 shadow-inner flex items-center justify-center transition-all ${barMoving ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'}`}
                             title="Toggle Movement"
                           >
                              <ArrowRight size={12} className={barMoving ? "animate-pulse" : ""} />
                           </button>
                           
                           {/* Speed Slider */}
                           <div className="h-5 flex-1 relative bg-zinc-900 rounded border border-zinc-800 shadow-inner flex items-center px-2">
                              <input 
                                type="range" 
                                min={0} 
                                max={3} 
                                step={0.1} 
                                value={barSpeed} 
                                onChange={(e) => onBarSpeedChange(parseFloat(e.target.value))} 
                                disabled={!barMoving}
                                className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:bg-zinc-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full ${!barMoving ? 'opacity-30 pointer-events-none' : ''}`}
                              />
                           </div>
                        </div>
                    </div>
                  </>
                )}
            </div>

            {/* Colors */}
            {mode !== VisualizerMode.SPRING_BAND && mode !== VisualizerMode.PAPER_BAND && (
              <>
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                        <Palette size={14} className="text-zinc-600 3xl:w-5 3xl:h-5" />
                        <span className="text-[9px] 3xl:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Color Palette</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {colors.map((c) => (
                          <button 
                            key={c} 
                            onClick={() => onColorChange(c)} 
                            className={`w-5 h-5 3xl:w-6 3xl:h-6 rounded-full transition-all shadow-sm ${
                              selectedColor === c 
                                ? 'ring-2 ring-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                                : 'hover:scale-105 ring-1 ring-white/10'
                            }`} 
                            style={{ backgroundColor: c }} 
                          />
                        ))}
                        <div className="w-[1px] h-4 bg-zinc-700 mx-1"></div>
                        <CustomColorPicker color={selectedColor} onChange={onColorChange} />
                    </div>
                </div>
              </>
            )}

            {mode === VisualizerMode.PAPER_BAND && (
               <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                        <Palette size={14} className="text-zinc-600 3xl:w-5 3xl:h-5" />
                        <span className="text-[9px] 3xl:text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Wave Colors</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {Array.from({ length: paperWaves }).map((_, i) => (
                           <CustomColorPicker 
                              key={i}
                              variant="swatch"
                              color={paperWaveColors[i] || paperWaveColors[i % paperWaveColors.length]} 
                              onChange={(c) => onPaperWaveColorChange(i, c)} 
                           />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Controls;