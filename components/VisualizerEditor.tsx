import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import VisualizerCanvas from './VisualizerCanvas';
import Controls from './Controls';
import ExportModal from './ExportModal';
import { VisualizerMode, VisualizerConfig, Theme } from '../types';
import { PRESETS_BY_MODE } from '../data/presets';
import { Origami, Activity, Spline, Waves, BarChart2, Trash2, Upload } from 'lucide-react';
import { DS, getThemeColor } from '../styles/designSystem';

// All color palettes and images are now managed in styls/designSystem.ts

// Image URLs are now managed in DS.images within styles/designSystem.ts

const DEBUG_MODE = false; // Toggle this to show X/Y/Height sliders and bounding boxes

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
  const [verticalShift, setVerticalShift] = useState(initialConfig?.verticalShift ?? -2);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFullMobilePreview, setIsFullMobilePreview] = useState(false);
  const [selectedGridIndex, setSelectedGridIndex] = useState(1);
  const [mockupImageDark, setMockupImageDark] = useState<string | null>(null);
  const [mockupImageLight, setMockupImageLight] = useState<string | null>(null);
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive the active palette based on theme
  const activePalette = theme === Theme.DARK ? DS.palettes.dark : DS.palettes.light;

  // Initialize color
  const [color, setColor] = useState<string>(initialConfig?.color ?? DS.palettes.dark[0]);

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
  const [paperWaveColors, setPaperWaveColors] = useState<string[]>(initialConfig?.paper?.colors ?? DS.palettes.paper);
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
  const [previewOffsetX, setPreviewOffsetX] = useState(0);
  const [previewOffsetY, setPreviewOffsetY] = useState(307);
  const [previewHeight, setPreviewHeight] = useState(766);
  const [previewMaskHeight, setPreviewMaskHeight] = useState(150);

  // Layout Scaling Logic
  const topSectionRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isReady, setIsReady] = useState(false);

  // Reference height for the "virtual" phone frame (unscaled)
  const VIRTUAL_HEIGHT = 640;

  const applyConfig = (config: VisualizerConfig) => {
    setMode(config.mode);
    if (config.sensitivity !== undefined) setSensitivity(config.sensitivity);
    if (config.color !== undefined) setColor(config.color);
    if (config.containerWidth !== undefined) setContainerWidth(config.containerWidth);
    if (config.verticalShift !== undefined) setVerticalShift(config.verticalShift);

    if (config.envelope) {
      if (config.envelope.amplitude !== undefined) setEnvelopeAmplitude(config.envelope.amplitude);
      if (config.envelope.speed !== undefined) setEnvelopeSpeed(config.envelope.speed);
      if (config.envelope.points !== undefined) setEnvelopePoints(config.envelope.points);
      if (config.envelope.opacity !== undefined) setEnvelopeFillOpacity(config.envelope.opacity);
      if (config.envelope.strokeWidth !== undefined) setEnvelopeStrokeWidth(config.envelope.strokeWidth);
      if (config.envelope.moving !== undefined) setEnvelopeMoving(config.envelope.moving);
    }

    if (config.paper) {
      if (config.paper.amount !== undefined) setPaperAmount(config.paper.amount);
      if (config.paper.waves !== undefined) setPaperWaves(config.paper.waves);
      if (config.paper.points !== undefined) setPaperPoints(config.paper.points);
      if (config.paper.idle !== undefined) setPaperIdleAmplitude(config.paper.idle);
      if (config.paper.strokeWidth !== undefined) setPaperStrokeWidth(config.paper.strokeWidth);
      if (config.paper.colors !== undefined) setPaperWaveColors(config.paper.colors);
      if (config.paper.moving !== undefined) setPaperMoving(config.paper.moving);
      if (config.paper.speed !== undefined) setPaperSpeed(config.paper.speed);
    }

    if (config.wave) {
      if (config.wave.amplitude !== undefined) setWaveAmplitude(config.wave.amplitude);
      if (config.wave.noise !== undefined) setWaveNoise(config.wave.noise);
      if (config.wave.speed !== undefined) setWaveSpeed(config.wave.speed);
      if (config.wave.moving !== undefined) setWaveMoving(config.wave.moving);
    }

    if (config.bars) {
      if (config.bars.waves !== undefined) setNumWaves(config.bars.waves);
      if (config.bars.width !== undefined) setBarWidth(config.bars.width);
      if (config.bars.height !== undefined) setBarHeight(config.bars.height);
      if (config.bars.spacing !== undefined) setBarSpacing(config.bars.spacing);
      if (config.bars.amplitude !== undefined) setBarAmplitude(config.bars.amplitude);
      if (config.bars.roundness !== undefined) setBarRoundness(config.bars.roundness);
      if (config.bars.moving !== undefined) setBarMoving(config.bars.moving);
      if (config.bars.speed !== undefined) setBarSpeed(config.bars.speed);
    }

    if (config.sino) {
      if (config.sino.amplitude !== undefined) setSinoAmplitude(config.sino.amplitude);
      if (config.sino.wavelength !== undefined) setSinoWavelength(config.sino.wavelength);
      if (config.sino.speed !== undefined) setSinoSpeed(config.sino.speed);
      if (config.sino.moving !== undefined) setSinoMoving(config.sino.moving);
    }
  };

  const handleModeSelect = (newMode: VisualizerMode) => {
    setMode(newMode);
    setSelectedGridIndex(1);
    const presetsForMode = PRESETS_BY_MODE[newMode];
    if (presetsForMode && presetsForMode.length > 0) {
      applyConfig(presetsForMode[0].config);
    }
  };

  const handlePresetSelect = (index: number) => {
    setSelectedGridIndex(index);
    const presetsForMode = PRESETS_BY_MODE[mode];
    if (presetsForMode && presetsForMode.length >= index) {
      applyConfig(presetsForMode[index - 1].config);
    }
  };


  useEffect(() => {
    if (!topSectionRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const padding = 0;
        const availableHeight = height - padding;
        const availableWidth = width - padding;
        const scaleH = availableHeight / VIRTUAL_HEIGHT;
        const scaleW = availableWidth / (VIRTUAL_HEIGHT * 2.5);
        const newScale = Math.min(scaleH, scaleW, 1);
        setPreviewScale(newScale);
        setIsReady(true);
      }
    });

    observer.observe(topSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // -- Auto-start Microphone on load/interaction --
  useEffect(() => {
    let hasStarted = false;

    const attemptStart = async () => {
      if (hasStarted || isListening) return;
      try {
        await start(true);
        hasStarted = true;
        // Cleanup listeners if successful
        removeListeners();
      } catch (err) {
        console.log("Auto-start blocked by browser. Waiting for user interaction...");
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', attemptStart);
      window.removeEventListener('touchstart', attemptStart);
      window.removeEventListener('keydown', attemptStart);
    };

    // 1. Immediate attempt (might work if permissions are already saved)
    attemptStart();

    // 2. Add listeners for any user gesture to "unlock" audio
    window.addEventListener('click', attemptStart, { once: true });
    window.addEventListener('touchstart', attemptStart, { once: true });
    window.addEventListener('keydown', attemptStart, { once: true });

    return () => removeListeners();
  }, [isListening, start]);

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
        next.push(DS.palettes.paper[next.length % DS.palettes.paper.length]);
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
      const newPalette = newTheme === Theme.DARK ? DS.palettes.dark : DS.palettes.light;
      setColor(newPalette[0]);
      return newTheme;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (png, jpg, jpeg).');
        return;
      }

      const isDark = theme === Theme.DARK;
      const currentMockup = isDark ? mockupImageDark : mockupImageLight;

      if (currentMockup) {
        URL.revokeObjectURL(currentMockup);
      }

      const imageUrl = URL.createObjectURL(file);
      if (isDark) setMockupImageDark(imageUrl);
      else setMockupImageLight(imageUrl);
    }
  };

  const handleClearImage = () => {
    const isDark = theme === Theme.DARK;
    const currentMockup = isDark ? mockupImageDark : mockupImageLight;

    if (currentMockup) {
      URL.revokeObjectURL(currentMockup);
    }

    if (isDark) setMockupImageDark(null);
    else setMockupImageLight(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentPhoneFrame = theme === Theme.DARK ? DS.images.phoneFrame.dark : DS.images.phoneFrame.light;
  const bgColor = getThemeColor(theme, 'bgMain');

  return (
    <div className={`relative w-full h-screen ${bgColor} overflow-hidden flex flex-col font-sans select-none`}>

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
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg ${DS.stroke.button} shadow-xl z-40 flex items-center gap-3 ${isSimulated ? `${DS.state.simulated.bg} ${DS.state.simulated.border} ${DS.state.simulated.text}` : `${DS.state.error.bg} ${DS.state.error.border} ${DS.state.error.text}`}`}>
              <span className="text-xs font-bold uppercase tracking-wide">{error}</span>
              {!isListening && (
                <button
                  onClick={() => start(true)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded ${DS.stroke.button} border-white/10 text-[10px] font-bold uppercase tracking-wider transition-all"
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
                  className={`${DS.typography.toggle} transition-colors ${theme === Theme.DARK ? DS.colors.dark.textPrimary : `${getThemeColor(theme, 'textSecondary')} ${getThemeColor(theme, 'textHoverPrimary')}`
                    }`}
                >
                  DARK
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(Theme.LIGHT)}
                  className={`${DS.typography.toggle} transition-colors ${theme === Theme.LIGHT ? DS.colors.light.textPrimary : `${getThemeColor(theme, 'textSecondary')} ${getThemeColor(theme, 'textHoverPrimary')}`
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
                    onClick={() => handleModeSelect(item.mode)}
                    className={`w-[80px] h-[60px] rounded-lg ${DS.stroke.button} flex flex-col items-center justify-center gap-2 transition-all ${theme === Theme.DARK
                      ? mode === item.mode
                        ? `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textPrimary} ${DS.colors.dark.outlineSelected}`
                        : `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textSecondary} ${DS.colors.dark.textHoverPrimary}`
                      : mode === item.mode
                        ? `${DS.colors.light.bgPanel} border-zinc-600 ${DS.colors.light.textPrimary} ${DS.colors.light.outlineSelected}`
                        : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary} ${DS.colors.light.textHoverPrimary}`
                      }`}
                  >
                    <item.icon size={16} strokeWidth={mode === item.mode ? 2.5 : 2} />
                    <span className={DS.typography.modeLabel}>{item.label}</span>
                  </button>
                ))}
                {/* Empty placeholder for 2x3 alignment if needed */}
                <div className="w-[80px] h-[60px]" />
              </div>

              {/* Preset ButtonGrid */}
              <div className="w-full flex flex-col gap-3">
                <span className={`${DS.typography.sectionHeader} ${getThemeColor(theme, 'textPrimary')}`}>Saved Presets</span>
                <div className="grid grid-cols-5 gap-2 w-full">
                  {PRESETS_BY_MODE[mode]?.map((preset, index) => {
                    const n = index + 1;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(n)}
                        className={`aspect-square rounded-lg ${DS.stroke.button} flex items-center justify-center ${DS.typography.preset} transition-all ${theme === Theme.DARK
                          ? selectedGridIndex === n
                            ? `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textPrimary} ${DS.colors.dark.outlineSelected}`
                            : `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textSecondary} ${DS.colors.dark.textHoverPrimary}`
                          : selectedGridIndex === n
                            ? `${DS.colors.light.bgPanel} border-zinc-600 ${DS.colors.light.textPrimary} ${DS.colors.light.outlineSelected}`
                            : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary} ${DS.colors.light.textHoverPrimary}`
                          }`}
                        title={preset.name}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Controls
                title={undefined} // Removed title "Paper 1"
                isListening={isListening}
                isSimulated={isSimulated}
                onToggleListening={isListening ? stop : () => start(true)}
                mode={mode} onModeChange={handleModeSelect}
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
                onOpenFullscreenPreview={() => setIsFullMobilePreview(true)}
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
              <h2 className={`${DS.typography.footerLogo} ${theme === Theme.DARK ? DS.colors.dark.textPrimary : DS.colors.light.textPrimary}`}>WAVEKIT</h2>
              <p className={`${DS.typography.footerText} leading-relaxed ${getThemeColor(theme, 'textSecondary')}`}>
                Experimental audio-reactive presets. Preview distinct visual styles, customize them in the editor, or export production-ready code.
              </p>
            </div>

            {/* Right Section - 20% width, aligned with description (title height + gap-3) */}
            <div className="flex flex-col items-end gap-1 w-[20%] pt-[52px]">
              <p className={`${DS.typography.footerText} ${getThemeColor(theme, 'textSecondary')}`}>Made by Sharang Sharma</p>
              <a
                href="https://www.sharangsharma.in"
                target="_blank"
                rel="noopener noreferrer"
                className={`${DS.typography.footerText} transition-colors ${getThemeColor(theme, 'textSecondary')} ${getThemeColor(theme, 'textHoverPrimary')}`}
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

      {/* Full Mobile Preview Overlay */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${isFullMobilePreview ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Fullscreen click-to-close backdrop */}
        <div
          className="absolute inset-0 bg-black/85 cursor-pointer"
          onClick={() => setIsFullMobilePreview(false)}
        />

        {/* Temporary XY Controls */}
        {DEBUG_MODE && (
          <div className="absolute top-8 left-8 z-[110] bg-zinc-900/90 p-6 rounded-2xl ${DS.stroke.button} border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-4 min-w-[200px]">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Debug Controls</span>
              <h3 className="text-white font-medium text-sm">Canvas Position</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/60 font-semibold uppercase">X Offset: {previewOffsetX}px</label>
                  <button onClick={() => setPreviewOffsetX(0)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Reset</button>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="400"
                  value={previewOffsetX}
                  onChange={(e) => setPreviewOffsetX(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/60 font-semibold uppercase">Y Offset: {previewOffsetY}px</label>
                  <button onClick={() => setPreviewOffsetY(314)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Default</button>
                </div>
                <input
                  type="range"
                  min="-600"
                  max="600"
                  value={previewOffsetY}
                  onChange={(e) => setPreviewOffsetY(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/60 font-semibold uppercase">Height: {previewHeight}px</label>
                  <button onClick={() => setPreviewHeight(766)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Default</button>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  value={previewHeight}
                  onChange={(e) => setPreviewHeight(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-white/60 font-semibold uppercase">Mask Height: {previewMaskHeight}px</label>
                  <button onClick={() => setPreviewMaskHeight(150)} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">Default</button>
                </div>
                <input
                  type="range"
                  min="10"
                  max="800"
                  value={previewMaskHeight}
                  onChange={(e) => setPreviewMaskHeight(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className={`pt-2 border-t ${getThemeColor(theme, 'border')} opacity-20`}>
              <p className={`text-[9px] ${getThemeColor(theme, 'textSecondary')} italic opacity-60`}>Use these to align the visualizer within the phone frame.</p>
            </div>
          </div>
        )}

        {/* Overlay Layout Container */}
        <div className="relative flex flex-col items-center gap-6">
          <div
            className="relative flex items-center justify-center transition-all duration-300"
            style={{ width: '396px', height: '802px' }}
            onMouseEnter={() => setIsPreviewHovered(true)}
            onMouseLeave={() => setIsPreviewHovered(false)}
          >
            {/* Visualizer Div Container (Behind PNG) */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden flex items-center justify-center rounded-[40px] ${bgColor}`}
              style={{ width: '354px', height: '766px' }}
            >
              {/* Exactly centered internal content */}
              <div className="relative h-full flex items-center justify-center w-full">
                {/* Background Mockup Image */}
                <img
                  src={theme === Theme.DARK
                    ? (mockupImageDark || DS.images.defaultMockup.dark)
                    : (mockupImageLight || DS.images.defaultMockup.light)
                  }
                  alt="Mockup"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none z-0"
                  referrerPolicy="no-referrer"
                />

                {/* Stacked Control Buttons (Visible on Hover) - Now at the Top with Icons */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-start pt-12 gap-3 z-30 transition-opacity duration-300 ${isPreviewHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className={`px-6 py-2 rounded-lg ${DS.stroke.button} flex items-center gap-2 transition-all ${theme === Theme.DARK
                      ? DS.buttons.dark.floating
                      : DS.buttons.light.floating
                      } text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-none`}
                  >
                    <Upload size={14} />
                    Upload Mockup
                  </button>

                  {(theme === Theme.DARK ? mockupImageDark : mockupImageLight) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearImage();
                      }}
                      className={`px-6 py-2 rounded-lg ${DS.stroke.button} flex items-center gap-2 transition-all ${theme === Theme.DARK
                        ? DS.buttons.dark.floating
                        : DS.buttons.light.floating
                        } text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-none`}
                    >
                      <Trash2 size={14} />
                      Remove Mockup
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />

                {/*
                  Mobile preview — two-div approach for clean, predictable transforms:
                  1. Outer div: handles POSITION only (centered horizontally, offsetY px from top).
                     Its size matches the final visual size after scaling.
                  2. Inner div: handles SCALE only from top-left origin.
                     Renders at containerWidth (same as editor) so pixel values are identical.
                  This avoids the transform-origin conflict that occurred when combining
                  translateX(-50%), translateY, and scale on a single element.
                */}
                <div
                  className={`absolute z-10 overflow-hidden ${DEBUG_MODE ? 'border border-blue-400/50' : ''}`}
                  style={{
                    width: '354px',
                    height: `${Math.round(previewMaskHeight * (354 / containerWidth))}px`,
                    left: '50%',
                    transform: `translateX(-50%) translateY(${previewOffsetY}px)`,
                  }}
                >
                  <div style={{
                    width: `${containerWidth}px`,
                    height: `${previewMaskHeight}px`,
                    transform: `scale(${(354 / containerWidth).toFixed(4)})`,
                    transformOrigin: 'top left',
                  }}>
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
              </div>
            </div>

            {/* Theme-based Mobile Frame PNG */}
            <img
              src={theme === Theme.DARK ? DS.images.fullMobileFrame.dark : DS.images.fullMobileFrame.light}
              alt="Full Mobile Frame"
              className="relative z-10 select-none block max-w-none w-full h-full pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerEditor;