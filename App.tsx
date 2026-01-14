import React, { useState, useEffect, useMemo } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import VisualizerCanvas from './components/VisualizerCanvas';
import Controls from './components/Controls';
import ExportModal from './components/ExportModal';
import { VisualizerMode, VisualizerConfig } from './types';

// Dark Mode Palette (Neon/Bright on Dark)
export const PALETTE_DARK = ['#40B9F8', '#5AFFBA', '#FFC700', '#FF87D1', '#8E8EFF', '#FFFFFF'];
// Light Mode Palette (Saturated/Darker on Light)
export const PALETTE_LIGHT = ['#0066CC', '#00A859', '#E65100', '#C2185B', '#4527A0', '#1A1A1A'];

// Try using the direct Googleusercontent domain which is often more reliable for embedding
const PHONE_FRAME_DARK = "https://lh3.googleusercontent.com/d/1YtgNRD5bhsW_JhFOfvscWU0nLmFGkXyd";
const PHONE_FRAME_LIGHT = "https://lh3.googleusercontent.com/d/1a4gwZ_bfhzv61f6Q2o3l8oekIGwixWQv";

const App: React.FC = () => {
  const { isListening, isSimulated, start, stop, getMetrics, error } = useAudioAnalyzer();
  const [mode, setMode] = useState<VisualizerMode>(VisualizerMode.PAPER_BAND);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sensitivity, setSensitivity] = useState(3); 
  const [currentRms, setCurrentRms] = useState(0);
  const [showPhoneFrame, setShowPhoneFrame] = useState(false);
  const [containerWidth, setContainerWidth] = useState(430);
  const [containerHeight, setContainerHeight] = useState(766);
  
  const currentPalette = theme === 'dark' ? PALETTE_DARK : PALETTE_LIGHT;
  const [color, setColor] = useState<string>(currentPalette[0]);
  const [verticalShift, setVerticalShift] = useState(-29); 
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset color selection when switching themes if the current color isn't in the new palette
  useEffect(() => {
    setColor(currentPalette[0]);
  }, [theme]);

  // Reset image error state when toggling frame or switching themes to allow retrying load
  useEffect(() => {
    setImageError(false);
  }, [theme, showPhoneFrame]);

  // Envelope Config
  const [envelopeAmplitude, setEnvelopeAmplitude] = useState(40); 
  const [envelopeSpeed, setEnvelopeSpeed] = useState(0.04);
  const [envelopePoints, setEnvelopePoints] = useState(20);
  const [envelopeFillOpacity, setEnvelopeFillOpacity] = useState(85);

  // Paper Band Config
  const [paperAmount, setPaperAmount] = useState(12);
  const [paperScale, setPaperScale] = useState(30); 
  const [paperWaves, setPaperWaves] = useState(2);
  const [paperPoints, setPaperPoints] = useState(10);
  const [paperIdleAmplitude, setPaperIdleAmplitude] = useState(() => {
    const saved = localStorage.getItem('paperIdleAmplitude');
    return saved !== null ? parseFloat(saved) : 2;
  });

  // Wave Config
  const [waveAmplitude, setWaveAmplitude] = useState(150);
  const [waveNoise, setWaveNoise] = useState(20);

  // Other mode defaults
  const [numWaves, setNumWaves] = useState(10);
  const [barWidth, setBarWidth] = useState(32); 
  const [barSpacing, setBarSpacing] = useState(10);
  const [barAmplitude, setBarAmplitude] = useState(100);
  const [sinoAmplitude, setSinoAmplitude] = useState(40);
  const [sinoWavelength, setSinoWavelength] = useState(300);
  const [sinoSpeed, setSinoSpeed] = useState(1.0);
  const [springStrands, setSpringStrands] = useState(3);
  const [springAmplitude, setSpringAmplitude] = useState(60);

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

  const currentConfig: VisualizerConfig = useMemo(() => ({
    mode,
    sensitivity,
    color,
    palette: currentPalette,
    containerWidth,
    containerHeight,
    verticalShift,
    envelope: {
      amplitude: envelopeAmplitude,
      speed: envelopeSpeed,
      points: envelopePoints,
      opacity: envelopeFillOpacity
    },
    wave: {
      amplitude: waveAmplitude,
      noise: waveNoise
    },
    sino: {
      amplitude: sinoAmplitude,
      wavelength: sinoWavelength,
      speed: sinoSpeed
    },
    paper: {
      amount: paperAmount,
      waves: paperWaves,
      points: paperPoints,
      idle: paperIdleAmplitude
    }
  }), [mode, sensitivity, color, currentPalette, containerWidth, containerHeight, verticalShift, envelopeAmplitude, envelopeSpeed, envelopePoints, envelopeFillOpacity, waveAmplitude, waveNoise, sinoAmplitude, sinoWavelength, sinoSpeed, paperAmount, paperWaves, paperPoints, paperIdleAmplitude]);

  return (
    <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center justify-center font-sans transition-colors duration-500 ${theme === 'dark' ? 'bg-[#12151E]' : 'bg-[#FCFCFD]'}`}>
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="max-w-full relative transform scale-100 transition-all duration-300" style={{ width: `${containerWidth}px`, height: `${containerHeight}px` }}>
          <VisualizerCanvas 
            isListening={isListening} 
            getMetrics={getMetrics} 
            mode={mode} 
            theme={theme}
            sensitivity={sensitivity} 
            color={color}
            palette={currentPalette}
            verticalShift={verticalShift} 
            numWaves={numWaves} 
            barWidth={barWidth} 
            barSpacing={barSpacing}
            barAmplitude={barAmplitude}
            sinoAmplitude={sinoAmplitude} 
            sinoWavelength={sinoWavelength} 
            sinoSpeed={sinoSpeed}
            springStrands={springStrands} 
            springAmplitude={springAmplitude}
            envelopeAmplitude={envelopeAmplitude}
            envelopeSpeed={envelopeSpeed}
            envelopePoints={envelopePoints}
            envelopeFillOpacity={envelopeFillOpacity}
            waveAmplitude={waveAmplitude} 
            waveNoise={waveNoise}
            paperAmount={paperAmount}
            paperScale={paperScale}
            paperWaves={paperWaves}
            paperPoints={paperPoints}
            paperIdleAmplitude={paperIdleAmplitude}
            containerWidth={containerWidth}
          />
        </div>
      </div>

      {showPhoneFrame && (
        !imageError ? (
          <img 
            src={theme === 'dark' ? PHONE_FRAME_DARK : PHONE_FRAME_LIGHT} 
            alt="Phone Frame" 
            referrerPolicy="no-referrer" 
            onError={() => {
              console.error("Failed to load phone frame image, switching to CSS fallback");
              setImageError(true);
            }} 
            className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-auto z-20 pointer-events-none transition-opacity duration-300" 
          />
        ) : (
          /* CSS Fallback Frame */
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70vh] aspect-[9/19] z-20 pointer-events-none border-8 rounded-[3rem] shadow-2xl transition-all duration-300 box-content flex flex-col items-center justify-between py-4 bg-transparent border-gray-800 opacity-80 backdrop-grayscale">
             {/* Notch */}
             <div className="w-1/3 h-6 bg-gray-900 rounded-full mb-auto" />
             {/* Home indicator area */}
             <div className="w-1/3 h-1 bg-gray-900/50 rounded-full mt-auto" />
          </div>
        )
      )}

      {error && (
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full z-40 flex items-center gap-3 backdrop-blur-md border ${isSimulated ? 'bg-yellow-900/40 border-yellow-500/50 text-yellow-100' : 'bg-red-900/50 border-red-500/50 text-red-100'}`}>
          <span className="text-sm font-medium">{error}</span>
          {!isListening && (
            <button 
              onClick={() => start(true)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      <Controls 
        theme={theme}
        onThemeChange={setTheme}
        isListening={isListening} 
        isSimulated={isSimulated}
        onToggleListening={isListening ? stop : () => start(true)} 
        mode={mode} onModeChange={setMode}
        sensitivity={sensitivity} onSensitivityChange={setSensitivity} verticalShift={verticalShift} onVerticalShiftChange={setVerticalShift}
        containerWidth={containerWidth} onContainerWidthChange={setContainerWidth}
        containerHeight={containerHeight} onContainerHeightChange={setContainerHeight}
        rms={currentRms * sensitivity}
        colors={currentPalette} selectedColor={color} onColorChange={setColor}
        numWaves={numWaves} onNumWavesChange={setNumWaves} barWidth={barWidth} onBarWidthChange={setBarWidth}
        barSpacing={barSpacing} onBarSpacingChange={setBarSpacing} barAmplitude={barAmplitude} onBarAmplitudeChange={setBarAmplitude}
        sinoAmplitude={sinoAmplitude} onSinoAmplitudeChange={setSinoAmplitude}
        sinoWavelength={sinoWavelength} onSinoWavelengthChange={setSinoWavelength} sinoSpeed={sinoSpeed} onSinoSpeedChange={setSinoSpeed}
        springStrands={springStrands} onSpringStrandsChange={setSpringStrands} springAmplitude={springAmplitude} onSpringAmplitudeChange={setSpringAmplitude}
        envelopeAmplitude={envelopeAmplitude} onEnvelopeAmplitudeChange={setEnvelopeAmplitude} 
        envelopeSpeed={envelopeSpeed} onEnvelopeSpeedChange={setEnvelopeSpeed}
        envelopePoints={envelopePoints} onEnvelopePointsChange={setEnvelopePoints}
        envelopeFillOpacity={envelopeFillOpacity} onEnvelopeFillOpacityChange={setEnvelopeFillOpacity}
        waveAmplitude={waveAmplitude} onWaveAmplitudeChange={setWaveAmplitude}
        waveNoise={waveNoise} onWaveNoiseChange={setWaveNoise}
        paperAmount={paperAmount} onPaperAmountChange={setPaperAmount}
        paperWaves={paperWaves} onPaperWavesChange={setPaperWaves}
        paperPoints={paperPoints} onPaperPointsChange={setPaperPoints}
        paperIdleAmplitude={paperIdleAmplitude} onPaperIdleAmplitudeChange={setPaperIdleAmplitude}
        showPhoneFrame={showPhoneFrame} onTogglePhoneFrame={() => setShowPhoneFrame(!showPhoneFrame)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={currentConfig}
      />
    </div>
  );
};

export default App;