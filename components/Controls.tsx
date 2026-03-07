import React from 'react';
import { Mic, MicOff, Waves, BarChart2, Settings2, Sliders, Palette, MoveHorizontal, MoveVertical, Spline, Layers, Eye, EyeOff, Zap, Activity, Hash, Origami, Waypoints, Moon, Sun, Droplets, Volume2, Code2, AlertTriangle, Power, ArrowRight, Move, Maximize } from 'lucide-react';
import { VisualizerMode, Theme, VisualizerConfig } from '../types';
import CustomColorPicker from './CustomColorPicker';
import { DS, getThemeColor } from '../styles/designSystem';

export interface ControlsProps {
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
  onOpenFullscreenPreview: () => void;
  title?: string;
}

const ControlKnobLike = ({ label, value, onChange, min, max, step, suffix = '', theme }: any) => {
  const isDark = theme === Theme.DARK;
  return (
    <div className="flex flex-col gap-1 min-w-[120px] flex-1">
      <div className="flex items-center justify-between">
        <span className={`${DS.typography.label} ${isDark ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{label}</span>
        <span className={`${DS.typography.value} ${isDark ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}{suffix}</span>
      </div>
      <div className={`h-5 relative rounded flex items-center px-2 ${isDark ? '' : ''}`}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:${DS.stroke.button} [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${isDark ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'}`}
        />
      </div>
    </div>
  );
};

const SlidingToggle = ({ isOn, onToggle, theme }: { isOn: boolean; onToggle: () => void; theme: Theme }) => {
  const isDark = theme === Theme.DARK;
  return (
    <button
      onClick={onToggle}
      className={`relative w-7 h-3.5 rounded-full transition-all duration-200 ${DS.stroke.button} ${isOn
        ? (isDark ? 'bg-white border-white' : 'bg-black border-black')
        : (isDark ? DS.colors.dark.toggleOff : DS.colors.light.toggleOff)
        }`}
    >
      <div
        className={`absolute top-[1.5px] w-[8px] h-[8px] rounded-full transition-all duration-200 ${isOn
          ? (isDark ? 'left-[15px] bg-black' : 'left-[15px] bg-white')
          : (isDark ? `left-[2px] ${DS.colors.dark.toggleCircleOff}` : `left-[2px] ${DS.colors.light.toggleCircleOff}`)
          }`}
      />
    </button>
  );
};

const Controls: React.FC<ControlsProps> = ({
  isListening, isSimulated, onToggleListening, mode, onModeChange, theme, onThemeToggle, sensitivity, onSensitivityChange,
  verticalShift, onVerticalShiftChange, containerWidth, onContainerWidthChange, rms,
  colors, selectedColor, onColorChange, numWaves, onNumWavesChange, barWidth, onBarWidthChange,
  barHeight = 50, onBarHeightChange = (_val: number) => { },
  barSpacing, onBarSpacingChange, barAmplitude, onBarAmplitudeChange,
  barRoundness = 100, onBarRoundnessChange = (_val: number) => { },
  barMoving = false, onBarMovingChange = (_val: boolean) => { },
  barSpeed = 1, onBarSpeedChange = (_val: number) => { },
  sinoAmplitude, onSinoAmplitudeChange, sinoWavelength,
  onSinoWavelengthChange, sinoSpeed, onSinoSpeedChange, sinoMoving = false, onSinoMovingChange = (_val: boolean) => { },
  springStrands, onSpringStrandsChange,
  springAmplitude, onSpringAmplitudeChange, envelopeAmplitude, onEnvelopeAmplitudeChange,
  envelopeSpeed, onEnvelopeSpeedChange, envelopePoints, onEnvelopePointsChange,
  envelopeFillOpacity, onEnvelopeFillOpacityChange,
  envelopeStrokeWidth = 4, onEnvelopeStrokeWidthChange = (_val: number) => { },
  envelopeMoving = false, onEnvelopeMovingChange = (_val: boolean) => { },
  waveAmplitude, onWaveAmplitudeChange,
  waveNoise, onWaveNoiseChange,
  waveSpeed = 1, onWaveSpeedChange = (_val: number) => { },
  waveMoving = true, onWaveMovingChange = (_val: boolean) => { },
  paperAmount, onPaperAmountChange,
  paperWaves, onPaperWavesChange,
  paperPoints, onPaperPointsChange,
  paperIdleAmplitude, onPaperIdleAmplitudeChange,
  paperStrokeWidth, onPaperStrokeWidthChange,
  paperWaveColors, onPaperWaveColorChange,
  paperMoving = false, onPaperMovingChange = (_val: boolean) => { },
  paperSpeed = 2, onPaperSpeedChange = (_val: number) => { },
  showPhoneFrame, onTogglePhoneFrame, onOpenExport, onOpenFullscreenPreview,
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
        <h1 className={`text-center text-xl 2xl:text-2xl font-bold mb-3 tracking-widest uppercase font-mono selection:bg-emerald-500/30 selection:text-emerald-200 transition-all shrink-0 ${theme === Theme.DARK ? 'text-white/50' : 'text-black/70'}`}>
          {title}
        </h1>
      )}

      {/* Hardware Chassis - Fully rounded for detached floating effect */}
      <div className={`${theme === Theme.DARK ? `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ring-white/5` : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ring-[#d4d4d8]`} ${DS.stroke.button} rounded-[24px] flex flex-col overflow-hidden ring-1 relative w-full`}>
        {/* Shine effect on top edge */}
        <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent pointer-events-none ${theme === Theme.DARK ? 'via-white/10' : ''}`}></div>

        {/* --- Top Deck: Transport & Global Status --- */}
        <div className={`${theme === Theme.DARK ? 'bg-[#1C1C1C] border-[#37373B]' : `${DS.colors.light.bgPanel} ${DS.colors.light.border}`} p-3 3xl:p-4 flex items-center justify-between border-b relative z-10 shrink-0`}>
          <div className="flex items-center gap-4 3xl:gap-6">
            {/* Main Power/Mic Button */}
            <div className="relative">
              <button
                onClick={onToggleListening}
                className={`w-12 h-12 3xl:w-14 3xl:h-14 rounded-full flex items-center justify-center ${DS.stroke.button} active:scale-95 transition-all duration-100 ${theme === Theme.DARK
                  ? (isListening ? 'shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] bg-[#1c1c1f] border-[#37373B]' : 'shadow-[0_4px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] bg-transparent border-[#37373B] hover:bg-[#37373B1A]')
                  : (isListening ? `bg-transparent border-[#d4d4d8] shadow-sm opacity-90` : `${DS.colors.light.bgMain} border-[#d4d4d8] hover:opacity-80`)
                  }`}
              >
                <Power size={18} className={`3xl:w-5 3xl:h-5 ${isListening ? 'text-[#ef4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : theme === Theme.DARK ? 'text-zinc-500' : 'text-zinc-600'}`} />
              </button>
              {/* LED Indicator Dot */}
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${DS.stroke.button} ${theme === Theme.DARK ? 'border-[#18181b]' : 'border-zinc-100'} ${isListening ? (isSimulated ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]') : theme === Theme.DARK ? 'bg-zinc-800' : 'bg-zinc-300'}`}></div>
            </div>

            {/* LCD Info Screen */}
            <div className={`h-12 3xl:h-14 ${DS.stroke.button} rounded-md p-2 px-3 flex flex-col justify-between min-w-[160px] 3xl:min-w-[180px] ${theme === Theme.DARK ? 'border-[#37373B]' : DS.colors.light.border}`}>
              <div className="flex items-center justify-between">
                <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Status</span>
                <span className={`${DS.typography.value} uppercase ${isListening ? (isSimulated ? 'text-amber-500' : 'text-emerald-500') : theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>
                  {isListening ? (isSimulated ? 'Simulating' : 'Live Input') : 'Standby'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${DS.typography.label} w-6 ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>RMS</span>
                <div className={`flex-1 h-1.5 rounded-sm overflow-hidden flex gap-[1px] ${theme === Theme.DARK ? 'bg-[#1a1a1a]' : 'bg-zinc-300'}`}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-[1px] transition-colors duration-75 ${(rms * 100) / 5 > i
                        ? i > 16 ? 'bg-red-500' : i > 12 ? 'bg-amber-500' : 'bg-emerald-500'
                        : theme === Theme.DARK ? 'bg-[#222]' : 'bg-zinc-400'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SENSITIVITY SLIDER - Moved to Top Deck */}
          <div className="flex-1 max-w-[200px] 3xl:max-w-[240px] px-4">
            <ControlKnobLike label="SENS" value={sensitivity} onChange={onSensitivityChange} min={0.1} max={4.0} step={0.1} theme={theme} />
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center gap-2">
            {/* Position Menu Button */}
            <div className="relative" ref={positionMenuRef}>
              <button
                disabled
                className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded ${DS.stroke.button} flex items-center justify-center transition-all opacity-40 cursor-not-allowed ${theme === Theme.DARK
                  ? `bg-transparent border-[#37373B] text-zinc-400`
                  : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary}`
                  }`}
                title="DEBUG: Canvas Position"
              >
                <Move size={14} className="3xl:w-4 3xl:h-4" />
              </button>
              {showPositionMenu && (
                <div className={`absolute top-full right-0 mt-2 p-3 ${DS.stroke.button} rounded-xl shadow-2xl z-50 w-[180px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 ${theme === Theme.DARK ? 'bg-[#1C1C1C] border-[#37373B]' : 'bg-[#fafafa] border-[#d4d4d8]'}`}>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Width</span>
                    </div>
                    <div className={`h-8 relative rounded flex items-center pr-1 overflow-hidden ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <div className={`h-full w-8 border-r flex items-center justify-center ${theme === Theme.DARK ? 'bg-zinc-800 border-[#37373B] text-zinc-500' : 'bg-zinc-300 border-zinc-400 text-zinc-600'}`}>
                        <MoveHorizontal size={14} />
                      </div>
                      <input
                        type="number"
                        value={containerWidth}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 3);
                          onContainerWidthChange(Number(val));
                        }}
                        className={`w-full bg-transparent text-right text-xs font-mono focus:outline-none px-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none ${theme === Theme.DARK ? 'text-zinc-300' : 'text-zinc-700'}`}
                      />
                    </div>
                  </div>

                  {/* Vertical Shift */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Shift Y</span>
                      <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{verticalShift.toFixed(0)}</span>
                    </div>
                    <div className={`h-6 relative rounded flex items-center px-2 ${theme === Theme.DARK ? '' : ''}`}>
                      <input
                        type="range"
                        min={-20}
                        max={20}
                        step={1}
                        value={verticalShift}
                        onChange={(e) => onVerticalShiftChange(parseFloat(e.target.value))}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'}`}
                      />
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className={`absolute -top-1 right-3 w-2 h-2 border-l border-t rotate-45 ${theme === Theme.DARK ? 'bg-[#1C1C1C] border-[#37373B]' : 'bg-[#fafafa] border-[#d4d4d8]'}`}></div>
                </div>
              )}
            </div>

            <button
              disabled
              className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded ${DS.stroke.button} flex items-center justify-center transition-all opacity-40 cursor-not-allowed ${theme === Theme.DARK
                ? `bg-transparent border-[#37373B] text-zinc-400`
                : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary}`
                }`}
              title="DEBUG: Toggle Phone Frame"
            >
              {showPhoneFrame ? <Eye size={14} className="3xl:w-4 3xl:h-4" /> : <EyeOff size={14} className="3xl:w-4 3xl:h-4" />}
            </button>
            <button onClick={onOpenFullscreenPreview} className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded ${DS.stroke.button} flex items-center justify-center transition-all ${theme === Theme.DARK
              ? 'bg-transparent border-[#37373B] text-zinc-300 hover:text-white hover:bg-[#37373B1A]'
              : `${DS.colors.light.bgPanel} border-[#d4d4d8] text-zinc-600 hover:bg-zinc-100`
              }`}
              title="Full Mobile Preview">
              <Maximize size={16} className="3xl:w-5 3xl:h-5" />
            </button>
            <button onClick={onOpenExport} className={`h-9 w-9 3xl:h-10 3xl:w-10 rounded ${DS.stroke.button} flex items-center justify-center transition-all ${theme === Theme.DARK
              ? 'bg-transparent border-[#37373B] text-zinc-400 hover:text-zinc-200 hover:bg-[#37373B1A]'
              : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary} ${DS.colors.light.textHoverPrimary}`
              }`}
              title="Export">
              <Code2 size={14} className="3xl:w-4 3xl:h-4" />
            </button>
          </div>
        </div>


        {/* --- Main Controls Deck --- */}
        <div className={`p-4 3xl:p-6 flex flex-col gap-4 3xl:gap-6 shrink-0 overflow-y-visible ${theme === Theme.DARK ? 'bg-[#1C1C1C]' : DS.colors.light.bgPanel}`}>

          {/* Mode Specific Controls */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-4 3xl:gap-x-8 3xl:gap-y-6">
            {mode === VisualizerMode.PAPER_BAND && (
              <>
                <ControlKnobLike label="Waves" value={paperWaves} onChange={onPaperWavesChange} min={1} max={5} step={1} theme={theme} />
                <ControlKnobLike label="Packing" value={paperPoints} onChange={onPaperPointsChange} min={4} max={80} step={1} theme={theme} />
                <ControlKnobLike label="Smoothing" value={paperAmount} onChange={onPaperAmountChange} min={2} max={40} step={1} theme={theme} />
                <ControlKnobLike label="Amplitude" value={paperIdleAmplitude} onChange={onPaperIdleAmplitudeChange} min={-30} max={5} step={0.1} theme={theme} />
                <ControlKnobLike label="Stroke" value={paperStrokeWidth} onChange={onPaperStrokeWidthChange} min={4} max={12} step={1} suffix="px" theme={theme} />

                {/* Movement Control Unit */}
                <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Movement</span>
                      <SlidingToggle
                        isOn={paperMoving}
                        onToggle={() => {
                          if (!paperMoving) onPaperSpeedChange(1);
                          onPaperMovingChange(!paperMoving);
                        }}
                        theme={theme}
                      />
                    </div>
                    <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{paperMoving ? paperSpeed.toFixed(1) : 'OFF'}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    {/* Speed Slider */}
                    <div className={`h-5 flex-1 relative rounded flex items-center px-2 ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={paperSpeed}
                        onChange={(e) => onPaperSpeedChange(parseFloat(e.target.value))}
                        disabled={!paperMoving}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : `[&::-webkit-slider-thumb]:bg-[#52525b] [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-[#a1a1aa]`} ${!paperMoving ? 'opacity-30 pointer-events-none' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === VisualizerMode.ENVELOPE && (
              <>
                <ControlKnobLike label="Amplitude" value={envelopeAmplitude} onChange={onEnvelopeAmplitudeChange} min={10} max={160} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Wavelength" value={envelopePoints} onChange={onEnvelopePointsChange} min={2} max={60} step={1} suffix="px" theme={theme} />

                {/* Movement Control Unit for Envelope */}
                <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Movement</span>
                      <SlidingToggle
                        isOn={envelopeMoving}
                        onToggle={() => {
                          if (!envelopeMoving) onEnvelopeSpeedChange(1);
                          onEnvelopeMovingChange(!envelopeMoving);
                        }}
                        theme={theme}
                      />
                    </div>
                    <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{envelopeMoving ? envelopeSpeed.toFixed(1) : 'OFF'}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    {/* Speed Slider */}
                    <div className={`h-5 flex-1 relative rounded flex items-center px-2 ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={envelopeSpeed}
                        onChange={(e) => onEnvelopeSpeedChange(parseFloat(e.target.value))}
                        disabled={!envelopeMoving}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'} ${!envelopeMoving ? 'opacity-30 pointer-events-none' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === VisualizerMode.SINO && (
              <>
                <ControlKnobLike label="Amplitude" value={sinoAmplitude} onChange={onSinoAmplitudeChange} min={5} max={200} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Wavelength" value={sinoWavelength} onChange={onSinoWavelengthChange} min={2} max={500} step={1} suffix="px" theme={theme} />

                {/* Movement Control Unit for Sino */}
                <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Movement</span>
                      <SlidingToggle
                        isOn={sinoMoving}
                        onToggle={() => {
                          if (!sinoMoving) onSinoSpeedChange(1);
                          onSinoMovingChange(!sinoMoving);
                        }}
                        theme={theme}
                      />
                    </div>
                    <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{sinoMoving ? sinoSpeed.toFixed(1) : 'OFF'}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    {/* Speed Slider */}
                    <div className={`h-5 flex-1 relative rounded flex items-center px-2 ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={sinoSpeed}
                        onChange={(e) => onSinoSpeedChange(parseFloat(e.target.value))}
                        disabled={!sinoMoving}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'} ${!sinoMoving ? 'opacity-30 pointer-events-none' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === VisualizerMode.WAVE && (
              <>
                <ControlKnobLike label="Amp" value={waveAmplitude} onChange={onWaveAmplitudeChange} min={-150} max={150} step={1} theme={theme} />
                <ControlKnobLike label="Noise" value={waveNoise} onChange={onWaveNoiseChange} min={0} max={100} step={1} theme={theme} />

                {/* Movement Control Unit for Wave */}
                <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Movement</span>
                      <SlidingToggle
                        isOn={waveMoving}
                        onToggle={() => {
                          if (!waveMoving) onWaveSpeedChange(1);
                          onWaveMovingChange(!waveMoving);
                        }}
                        theme={theme}
                      />
                    </div>
                    <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{waveMoving ? waveSpeed.toFixed(1) : 'OFF'}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    {/* Speed Slider */}
                    <div className={`h-5 flex-1 relative rounded flex items-center px-2 ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={waveSpeed}
                        onChange={(e) => onWaveSpeedChange(parseFloat(e.target.value))}
                        disabled={!waveMoving}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'} ${!waveMoving ? 'opacity-30 pointer-events-none' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === VisualizerMode.BARS && (
              <>
                <ControlKnobLike label="Waves" value={numWaves} onChange={onNumWavesChange} min={3} max={40} step={1} theme={theme} />
                <ControlKnobLike label="Width" value={barWidth} onChange={onBarWidthChange} min={2} max={100} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Spacing" value={barSpacing} onChange={onBarSpacingChange} min={2} max={40} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Amplitude" value={barAmplitude} onChange={onBarAmplitudeChange} min={2} max={140} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Height" value={barHeight} onChange={onBarHeightChange} min={0} max={50} step={1} suffix="px" theme={theme} />
                <ControlKnobLike label="Roundness" value={barRoundness} onChange={onBarRoundnessChange} min={0} max={100} step={1} suffix="%" theme={theme} />

                {/* Movement Control Unit for Bars */}
                <div className="flex flex-col gap-1 min-w-[120px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${DS.typography.label} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Movement</span>
                      <SlidingToggle
                        isOn={barMoving}
                        onToggle={() => {
                          if (!barMoving) onBarSpeedChange(1);
                          onBarMovingChange(!barMoving);
                        }}
                        theme={theme}
                      />
                    </div>
                    <span className={`${DS.typography.value} ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>{barMoving ? barSpeed.toFixed(1) : 'OFF'}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    {/* Speed Slider */}
                    <div className={`h-5 flex-1 relative rounded flex items-center px-2 ${theme === Theme.DARK ? 'shadow-inner' : ''}`}>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={barSpeed}
                        onChange={(e) => onBarSpeedChange(parseFloat(e.target.value))}
                        disabled={!barMoving}
                        className={`w-full h-1 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-runnable-track]:${DS.stroke.slider} [&::-webkit-slider-runnable-track]:rounded-full ${theme === Theme.DARK ? '[&::-webkit-slider-thumb]:bg-zinc-400 [&::-webkit-slider-thumb]:border-black/50 [&::-webkit-slider-runnable-track]:bg-[#37373B]' : '[&::-webkit-slider-thumb]:bg-zinc-600 [&::-webkit-slider-thumb]:border-white/50 [&::-webkit-slider-runnable-track]:bg-zinc-400'} ${!barMoving ? 'opacity-30 pointer-events-none' : ''}`}
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
              <div className="flex items-center gap-6 pt-1">
                <span className={`${DS.typography.label} whitespace-nowrap ${theme === Theme.DARK ? DS.colors.dark.textSecondary : 'text-zinc-600'}`}>Colour</span>
                <div className="flex gap-2 items-center">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => onColorChange(c)}
                      className={`w-5 h-5 3xl:w-6 3xl:h-6 rounded-full transition-all ${selectedColor === c
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-105 ring-1 ring-white/10'
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className={`w-[1px] h-4 mx-1 ${getThemeColor(theme, 'divider')}`}></div>
                  <CustomColorPicker color={selectedColor} onChange={onColorChange} theme={theme} />
                </div>
              </div>
            </>
          )}

          {mode === VisualizerMode.PAPER_BAND && (
            <div className="flex items-center gap-6 pt-1">
              <span className={`${DS.typography.label} whitespace-nowrap ${theme === Theme.DARK ? DS.colors.dark.textSecondary : DS.colors.light.textSecondary}`}>Change colour</span>
              <div className="flex gap-2 items-center">
                {Array.from({ length: paperWaves }).map((_, i) => (
                  <CustomColorPicker
                    key={i}
                    variant="swatch"
                    color={paperWaveColors[i] || paperWaveColors[i % paperWaveColors.length]}
                    onChange={(c) => onPaperWaveColorChange(i, c)}
                    theme={theme}
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