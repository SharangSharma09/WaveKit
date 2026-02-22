import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import VisualizerCanvas from './VisualizerCanvas';
import Controls from './Controls';
import ExportModal from './ExportModal';
import { VisualizerMode, VisualizerConfig, Theme } from '../types';
import { Origami, Activity, Spline, Waves, BarChart2 } from 'lucide-react';

// Sorted lexicographically: 4 -> 5 -> 9 -> A -> F2 -> F6 -> FF
const DARK_MODE_COLORS = ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#A6A6A6', '#F2C94C', '#F65CB1', '#FFFFFF'];
// Light mode presets as requested
const LIGHT_MODE_COLORS = ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C', '#D1D1D1', '#000000'];

const DEFAULT_PAPER_COLORS = ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C'];

const PHONE_FRAME_DARK = "https://drive.google.com/thumbnail?id=1YtgNRD5bhsW_JhFOfvscWU0nLmFGkXyd&sz=w2000";
const PHONE_FRAME_LIGHT = "https://drive.google.com/thumbnail?id=1a4gwZ_bfhzv61f6Q2o3l8oekIGwixWQv&sz=w2000";

interface VisualizerEditorProps {
  initialConfig?: VisualizerConfig;
  onBack: () => void;
}

const VisualizerEditor: React.FC<VisualizerEditorProps> = ({ initialConfig, onBack }) => {
  const { isListening, isSimulated, start, stop, getMetrics, error } = useAudioAnalyzer();

  // -- Initialization from props or defaults --
  const [mode, setMode] = useState<VisualizerMode>(initialConfig?.mode ?? VisualizerMode.PAPER_BAND);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [sensitivity, setSensitivity] = useState(initialConfig?.sensitivity ?? 1.5);
  const [currentRms, setCurrentRms] = useState(0);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [containerWidth, setContainerWidth] = useState(initialConfig?.containerWidth ?? 784);
  const [verticalShift, setVerticalShift] = useState(initialConfig?.verticalShift ?? 0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedGridIndex, setSelectedGridIndex] = useState(2);

  // Derive the active palette based on theme
  const activePalette = theme === Theme.DARK ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;

  // Initialize color
  const [color, setColor] = useState<string>(initialConfig?.color ?? DARK_MODE_COLORS[0]);

  // Envelope Config
  const [envelopeAmplitude, setEnvelopeAmplitude] = useState(initialConfig?.envelope?.amplitude ?? 40);
  const [envelopeSpeed, setEnvelopeSpeed] = useState(initialConfig?.envelope?.speed ?? 1);
  const [envelopePoints, setEnvelopePoints] = useState(initialConfig?.envelope?.points ?? 20);
  const [envelopeFillOpacity, setEnvelopeFillOpacity] = useState(initialConfig?.envelope?.opacity ?? 20);
  const [envelopeStrokeWidth, setEnvelopeStrokeWidth] = useState(initialConfig?.envelope?.strokeWidth ?? 6);
  const [envelopeMoving, setEnvelopeMoving] = useState(initialConfig?.envelope?.moving ?? false);

  // Paper Band Config
  const [paperAmount, setPaperAmount] = useState(initialConfig?.paper?.amount ?? 12);
  const [paperScale, setPaperScale] = useState(30);
  const [paperWaves, setPaperWaves] = useState(initialConfig?.paper?.waves ?? 3);
  const [paperPoints, setPaperPoints] = useState(initialConfig?.paper?.points ?? 10);
  const [paperIdleAmplitude, setPaperIdleAmplitude] = useState(() => {
    if (initialConfig?.paper?.idle !== undefined) return initialConfig.paper.idle;
    const saved = localStorage.getItem('paperIdleAmplitude');
    return saved !== null ? parseFloat(saved) : 2;
  });
  const [paperStrokeWidth, setPaperStrokeWidth] = useState(initialConfig?.paper?.strokeWidth ?? 6);
  const [paperWaveColors, setPaperWaveColors] = useState<string[]>(initialConfig?.paper?.colors ?? DEFAULT_PAPER_COLORS);
  const [paperMoving, setPaperMoving] = useState(initialConfig?.paper?.moving ?? false);
  const [paperSpeed, setPaperSpeed] = useState(initialConfig?.paper?.speed ?? 1);

  // Wave Config
  const [waveAmplitude, setWaveAmplitude] = useState(initialConfig?.wave?.amplitude ?? 150);
  const [waveNoise, setWaveNoise] = useState(initialConfig?.wave?.noise ?? 20);
  const [waveSpeed, setWaveSpeed] = useState(initialConfig?.wave?.speed ?? 1);
  const [waveMoving, setWaveMoving] = useState(initialConfig?.wave?.moving ?? true);

  // Bars Config
  const [numWaves, setNumWaves] = useState(initialConfig?.bars?.waves ?? 10);
  const [barWidth, setBarWidth] = useState(initialConfig?.bars?.width ?? 32);
  const [barHeight, setBarHeight] = useState(initialConfig?.bars?.height ?? 50);
  const [barSpacing, setBarSpacing] = useState(initialConfig?.bars?.spacing ?? 10);
  const [barAmplitude, setBarAmplitude] = useState(initialConfig?.bars?.amplitude ?? 100);
  const [barRoundness, setBarRoundness] = useState(initialConfig?.bars?.roundness ?? 100);
  const [barMoving, setBarMoving] = useState(initialConfig?.bars?.moving ?? false);
  const [barSpeed, setBarSpeed] = useState(initialConfig?.bars?.speed ?? 1);

  // Sino Config
  const [sinoAmplitude, setSinoAmplitude] = useState(initialConfig?.sino?.amplitude ?? 40);
  const [sinoWavelength, setSinoWavelength] = useState(initialConfig?.sino?.wavelength ?? 300);
  const [sinoSpeed, setSinoSpeed] = useState(initialConfig?.sino?.speed ?? 1.0);
  const [sinoMoving, setSinoMoving] = useState(initialConfig?.sino?.moving ?? false);

  const [springStrands, setSpringStrands] = useState(3);
  const [springAmplitude, setSpringAmplitude] = useState(60);
  const [imageError, setImageError] = useState(false);

  // Layout Scaling Logic
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Reference height for the "virtual" phone frame (unscaled)
  const VIRTUAL_HEIGHT = 640;

  useEffect(() => {
    if (!topSectionRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // No padding so phone frame can stick to the top edge
        const padding = 0;

        // Calculate scale to fit strictly within the height
        const availableHeight = height - padding;
        const availableWidth = width - padding;

        // Scale based on height primarily, but ensure width fits too (assuming approx 2:1 aspect for landscape phone)
        const scaleH = availableHeight / VIRTUAL_HEIGHT;
        const scaleW = availableWidth / (VIRTUAL_HEIGHT * 2.5); // Generous width assumption

        const newScale = Math.min(scaleH, scaleW, 1);
        setPreviewScale(newScale);
        setIsReady(true);
      }
    });

    observer.observe(topSectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    localStorage.setItem('paperIdleAmplitude', paperIdleAmplitude.toString());
  }, [paperIdleAmplitude]);

  useEffect(() => {
    let raf: number;
    const updateUI = () => {
      if (isListening) setCurrentRms(getMetrics().rms);
      else setCurrentRms(0);
      raf = requestAnimationFrame(updateUI);
    };
    raf = requestAnimationFrame(updateUI);
    return () => cancelAnimationFrame(raf);
  }, [isListening, getMetrics]);

  const handlePaperWaveColorChange = (index: number, newColor: string) => {
    setPaperWaveColors(prev => {
      const next = [...prev];
      while (next.length <= index) {
        next.push(DEFAULT_PAPER_COLORS[next.length % DEFAULT_PAPER_COLORS.length]);
      }
      next[index] = newColor;
      return next;
    });
  };

  const currentConfig: VisualizerConfig = useMemo(() => ({
    mode,
    sensitivity,
    color,
    palette: activePalette,
    containerWidth,
    verticalShift,
    envelope: {
      amplitude: envelopeAmplitude,
      speed: envelopeSpeed,
      points: envelopePoints,
      opacity: envelopeFillOpacity,
      strokeWidth: envelopeStrokeWidth,
      moving: envelopeMoving
    },
    wave: {
      amplitude: waveAmplitude,
      noise: waveNoise,
      speed: waveSpeed,
      moving: waveMoving
    },
    sino: {
      amplitude: sinoAmplitude,
      wavelength: sinoWavelength,
      speed: sinoSpeed,
      moving: sinoMoving
    },
    paper: {
      amount: paperAmount,
      waves: paperWaves,
      points: paperPoints,
      idle: paperIdleAmplitude,
      strokeWidth: paperStrokeWidth,
      colors: paperWaveColors,
      moving: paperMoving,
      speed: paperSpeed
    },
    bars: {
      waves: numWaves,
      width: barWidth,
      height: barHeight,
      spacing: barSpacing,
      amplitude: barAmplitude,
      roundness: barRoundness,
      moving: barMoving,
      speed: barSpeed
    }
  }), [mode, sensitivity, color, activePalette, containerWidth, verticalShift, envelopeAmplitude, envelopeSpeed, envelopePoints, envelopeFillOpacity, envelopeStrokeWidth, envelopeMoving, waveAmplitude, waveNoise, waveSpeed, waveMoving, sinoAmplitude, sinoWavelength, sinoSpeed, sinoMoving, paperAmount, paperWaves, paperPoints, paperIdleAmplitude, paperStrokeWidth, paperWaveColors, paperMoving, paperSpeed, numWaves, barWidth, barHeight, barSpacing, barAmplitude, barRoundness, barMoving, barSpeed]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === Theme.DARK ? Theme.LIGHT : Theme.DARK;
      const newPalette = newTheme === Theme.DARK ? DARK_MODE_COLORS : LIGHT_MODE_COLORS;
      setColor(newPalette[0]);
      return newTheme;
    });
  };

  const currentPhoneFrame = theme === Theme.DARK ? PHONE_FRAME_DARK : PHONE_FRAME_LIGHT;
  const bgColor = theme === Theme.DARK ? 'bg-[#1C1C1C]' : 'bg-[#e4e4e7]';

  return (
    <div className={`relative w-full h-screen ${bgColor} transition-colors duration-500 overflow-hidden flex flex-col font-sans select-none`}>

      {/* Main Column Layout - No Scrolling */}
      <div className="flex flex-col h-full w-full items-center">

        {/* Top Section: 40% Height Preview Area - Aligns content to bottom */}
        <div
          ref={topSectionRef}
          className="h-[40vh] w-full relative flex flex-col justify-start items-center overflow-hidden shrink-0 pt-0"
        >
          <div
            className="relative flex items-center justify-center transition-opacity duration-300 shrink-0"
            style={{
              height: `${VIRTUAL_HEIGHT}px`,
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              opacity: isReady ? 1 : 0
            }}
          >
            <div className="relative h-full flex items-start justify-center">

              {/* Visualizer Canvas Layer */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div
                  className="relative h-full transition-all duration-300 transform scale-90 origin-center"
                  style={{ width: `${containerWidth}px` }}
                >
                  <VisualizerCanvas
                    isListening={isListening}
                    getMetrics={getMetrics}
                    mode={mode}
                    theme={theme}
                    sensitivity={sensitivity}
                    color={color}
                    palette={activePalette}
                    verticalShift={verticalShift}
                    numWaves={numWaves}
                    barWidth={barWidth}
                    barHeight={barHeight}
                    barSpacing={barSpacing}
                    barAmplitude={barAmplitude}
                    barRoundness={barRoundness}
                    barMoving={barMoving}
                    barSpeed={barSpeed}
                    sinoAmplitude={sinoAmplitude}
                    sinoWavelength={sinoWavelength}
                    sinoSpeed={sinoSpeed}
                    sinoMoving={sinoMoving}
                    springStrands={springStrands}
                    springAmplitude={springAmplitude}
                    envelopeAmplitude={envelopeAmplitude}
                    envelopeSpeed={envelopeSpeed}
                    envelopePoints={envelopePoints}
                    envelopeFillOpacity={envelopeFillOpacity}
                    envelopeStrokeWidth={envelopeStrokeWidth}
                    envelopeMoving={envelopeMoving}
                    waveAmplitude={waveAmplitude}
                    waveNoise={waveNoise}
                    waveSpeed={waveSpeed}
                    waveMoving={waveMoving}
                    paperAmount={paperAmount}
                    paperScale={paperScale}
                    paperWaves={paperWaves}
                    paperPoints={paperPoints}
                    paperIdleAmplitude={paperIdleAmplitude}
                    paperStrokeWidth={paperStrokeWidth}
                    paperWaveColors={paperWaveColors}
                    paperMoving={paperMoving}
                    paperSpeed={paperSpeed}
                    containerWidth={containerWidth}
                  />
                </div>
              </div>

              {/* Phone Frame */}
              {showPhoneFrame && !imageError && (
                <img
                  src={currentPhoneFrame}
                  alt="Phone Frame"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="relative h-full w-auto object-contain pointer-events-none z-20 select-none block"
                />
              )}
            </div>
          </div>

          {/* Error Toast */}
          {error && (
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg border shadow-xl z-40 flex items-center gap-3 ${isSimulated ? 'bg-[#2a1c05] border-yellow-800 text-yellow-200' : 'bg-[#2a0505] border-red-800 text-red-200'}`}>
              <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
              {!isListening && (
                <button
                  onClick={() => start(true)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* 10px Spacer/Placeholder */}
        <div className="h-[10px] w-full shrink-0" />

        {/* Controls Section: 900px total width, center-aligned — button grid + Control Panel */}
        <div className="shrink-0 w-full flex justify-center pb-4 px-4 z-30">
          <div className="w-full max-w-[900px] flex items-start gap-6">
            {/* Left: Theme labels + numbered button grid (Wave visualisation editor) */}
            <div className="flex flex-col gap-6 items-start shrink-0 w-[256px]">
              <div className="flex gap-4 items-center">
                <button
                  type="button"
                  onClick={() => setTheme(Theme.DARK)}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${theme === Theme.DARK ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                >
                  DARK
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(Theme.LIGHT)}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${theme === Theme.LIGHT ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
                    }`}
                >
                  LIGHT
                </button>
              </div>

              {/* Visualisation button grid */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {[
                  { mode: VisualizerMode.PAPER_BAND, label: 'PAPER', icon: Origami },
                  { mode: VisualizerMode.ENVELOPE, label: 'ENVELOPE', icon: Activity },
                  { mode: VisualizerMode.SINO, label: 'SINO', icon: Spline },
                  { mode: VisualizerMode.WAVE, label: 'WAVE', icon: Waves },
                  { mode: VisualizerMode.BARS, label: 'BARS', icon: BarChart2 },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setMode(item.mode)}
                    className={`aspect-square rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${theme === Theme.DARK
                      ? mode === item.mode
                        ? 'bg-[#27272a] border-white text-white'
                        : 'bg-[#27272a] border-[#3f3f46] text-zinc-500 hover:text-zinc-400'
                      : mode === item.mode
                        ? 'bg-zinc-300 border-zinc-600 text-zinc-900'
                        : 'bg-zinc-200 border-zinc-300 text-zinc-500 hover:text-zinc-700'
                      }`}
                  >
                    <item.icon size={24} strokeWidth={mode === item.mode ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
                {/* Empty placeholder for 2x3 alignment if needed */}
                <div className="w-[80px] h-[40px]" />
              </div>

              {/* Separator Line */}
              <div className={`w-full h-[1px] ${theme === Theme.DARK ? 'bg-zinc-800' : 'bg-zinc-300'}`} />

              {/* Preset ButtonGrid */}
              <div className="grid grid-cols-5 gap-2 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedGridIndex(n)}
                    className={`aspect-square rounded-lg border flex items-center justify-center text-sm font-mono transition-all ${theme === Theme.DARK
                      ? selectedGridIndex === n
                        ? 'bg-[#27272a] border-white text-white'
                        : 'bg-[#27272a] border-[#3f3f46] text-zinc-400 hover:text-zinc-300'
                      : selectedGridIndex === n
                        ? 'bg-zinc-300 border-zinc-600 text-zinc-900'
                        : 'bg-zinc-200 border-zinc-300 text-zinc-600 hover:text-zinc-800'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Controls
                title={undefined} // Removed title "Paper 1"
                isListening={isListening}
                isSimulated={isSimulated}
                onToggleListening={isListening ? stop : () => start(true)}
                mode={mode} onModeChange={setMode}
                theme={theme} onThemeToggle={toggleTheme}
                sensitivity={sensitivity} onSensitivityChange={setSensitivity} verticalShift={verticalShift} onVerticalShiftChange={setVerticalShift}
                containerWidth={containerWidth} onContainerWidthChange={setContainerWidth} rms={currentRms * sensitivity}
                colors={activePalette} selectedColor={color} onColorChange={setColor}
                numWaves={numWaves} onNumWavesChange={setNumWaves} barWidth={barWidth} onBarWidthChange={setBarWidth}
                barHeight={barHeight} onBarHeightChange={setBarHeight}
                barSpacing={barSpacing} onBarSpacingChange={setBarSpacing} barAmplitude={barAmplitude} onBarAmplitudeChange={setBarAmplitude}
                barRoundness={barRoundness} onBarRoundnessChange={setBarRoundness}
                barMoving={barMoving} onBarMovingChange={setBarMoving} barSpeed={barSpeed} onBarSpeedChange={setBarSpeed}
                sinoAmplitude={sinoAmplitude} onSinoAmplitudeChange={setSinoAmplitude}
                sinoWavelength={sinoWavelength} onSinoWavelengthChange={setSinoWavelength} sinoSpeed={sinoSpeed} onSinoSpeedChange={setSinoSpeed}
                sinoMoving={sinoMoving} onSinoMovingChange={setSinoMoving}
                springStrands={springStrands} onSpringStrandsChange={setSpringStrands} springAmplitude={springAmplitude} onSpringAmplitudeChange={setSpringAmplitude}
                envelopeAmplitude={envelopeAmplitude} onEnvelopeAmplitudeChange={setEnvelopeAmplitude}
                envelopeSpeed={envelopeSpeed} onEnvelopeSpeedChange={setEnvelopeSpeed}
                envelopePoints={envelopePoints} onEnvelopePointsChange={setEnvelopePoints}
                envelopeFillOpacity={envelopeFillOpacity} onEnvelopeFillOpacityChange={setEnvelopeFillOpacity}
                envelopeStrokeWidth={envelopeStrokeWidth} onEnvelopeStrokeWidthChange={setEnvelopeStrokeWidth}
                envelopeMoving={envelopeMoving} onEnvelopeMovingChange={setEnvelopeMoving}
                waveAmplitude={waveAmplitude} onWaveAmplitudeChange={setWaveAmplitude}
                waveNoise={waveNoise} onWaveNoiseChange={setWaveNoise}
                waveSpeed={waveSpeed} onWaveSpeedChange={setWaveSpeed}
                waveMoving={waveMoving} onWaveMovingChange={setWaveMoving}
                paperAmount={paperAmount} onPaperAmountChange={setPaperAmount}
                paperWaves={paperWaves} onPaperWavesChange={setPaperWaves}
                paperPoints={paperPoints} onPaperPointsChange={setPaperPoints}
                paperIdleAmplitude={paperIdleAmplitude} onPaperIdleAmplitudeChange={setPaperIdleAmplitude}
                paperStrokeWidth={paperStrokeWidth} onPaperStrokeWidthChange={setPaperStrokeWidth}
                paperWaveColors={paperWaveColors} onPaperWaveColorChange={handlePaperWaveColorChange}
                paperMoving={paperMoving} onPaperMovingChange={setPaperMoving}
                paperSpeed={paperSpeed} onPaperSpeedChange={setPaperSpeed}
                showPhoneFrame={showPhoneFrame} onTogglePhoneFrame={() => setShowPhoneFrame(!showPhoneFrame)}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <footer className={`w-full shrink-0 pt-4 pb-8 px-4 ${theme === Theme.DARK ? 'bg-[#1A1A1A]' : bgColor}`}>
          <div className="w-full max-w-[900px] mx-auto flex justify-between items-start">
            {/* Left Section - 60% width */}
            <div className="flex flex-col gap-3 w-[60%]">
              <h2 className={`text-4xl font-bold italic font-mono ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>WAVEKIT</h2>
              <p className={`text-[0.8rem] font-mono leading-relaxed ${theme === Theme.DARK ? 'text-[#AAAAAA]' : 'text-[#555555]'}`}>
                Experimental audio-reactive presets. Preview distinct visual styles, customize them in the editor, or export production-ready code.
              </p>
            </div>

            {/* Right Section - 20% width, aligned with description (title height + gap-3) */}
            <div className="flex flex-col items-end gap-1 w-[20%] pt-[52px]">
              <p className={`text-[0.8rem] font-mono ${theme === Theme.DARK ? 'text-[#AAAAAA]' : 'text-[#555555]'}`}>Made by Sharang Sharma</p>
              <a
                href="https://www.sharangsharma.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[0.8rem] font-mono transition-colors ${theme === Theme.DARK ? 'text-[#AAAAAA] hover:text-white' : 'text-[#555555] hover:text-black'}`}
              >
                www.sharangsharma.in
              </a>
            </div>
          </div>
        </footer>

      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={currentConfig}
      />
    </div>
  );
};

export default VisualizerEditor;