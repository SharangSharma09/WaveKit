import React, { useState, useEffect, useMemo } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import VisualizerCanvas from './components/VisualizerCanvas';
import Controls from './components/Controls';
import ExportModal from './components/ExportModal';
import { VisualizerMode, VisualizerConfig, Theme } from './types';

export const VISUALIZER_COLORS = ['#40B9F8', '#5AFFBA', '#FFC700', '#FF87D1', '#8E8EFF', '#FFFFFF'];
const PHONE_FRAME_DARK = "https://drive.google.com/thumbnail?id=1YtgNRD5bhsW_JhFOfvscWU0nLmFGkXyd&sz=w2000";
const PHONE_FRAME_LIGHT = "https://drive.google.com/thumbnail?id=1a4gwZ_bfhzv61f6Q2o3l8oekIGwixWQv&sz=w2000";

const App: React.FC = () => {
  const { isListening, isSimulated, start, stop, getMetrics, error } = useAudioAnalyzer();
  const [mode, setMode] = useState<VisualizerMode>(VisualizerMode.PAPER_BAND);
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [sensitivity, setSensitivity] = useState(1.5); 
  const [currentRms, setCurrentRms] = useState(0);
  const [showPhoneFrame, setShowPhoneFrame] = useState(true);
  const [containerWidth, setContainerWidth] = useState(480);
  const [color, setColor] = useState<string>(VISUALIZER_COLORS[0]);
  const [verticalShift, setVerticalShift] = useState(-30); 
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Envelope Config
  const [envelopeAmplitude, setEnvelopeAmplitude] = useState(40); 
  const [envelopeSpeed, setEnvelopeSpeed] = useState(0.04);
  const [envelopePoints, setEnvelopePoints] = useState(20);
  const [envelopeFillOpacity, setEnvelopeFillOpacity] = useState(85);

  // Paper Band Config
  const [paperAmount, setPaperAmount] = useState(12);
  const [paperScale, setPaperScale] = useState(30); 
  const [paperWaves, setPaperWaves] = useState(3);
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
  const [imageError, setImageError] = useState(false);

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
    palette: VISUALIZER_COLORS,
    containerWidth,
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
  }), [mode, sensitivity, color, containerWidth, verticalShift, envelopeAmplitude, envelopeSpeed, envelopePoints, envelopeFillOpacity, waveAmplitude, waveNoise, sinoAmplitude, sinoWavelength, sinoSpeed, paperAmount, paperWaves, paperPoints, paperIdleAmplitude]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const currentPhoneFrame = theme === Theme.DARK ? PHONE_FRAME_DARK : PHONE_FRAME_LIGHT;
  const bgColor = theme === Theme.DARK ? 'bg-[#12151E]' : 'bg-[#FCFCFD]';

  return (
    <div className={`relative w-full h-screen ${bgColor} transition-colors duration-500 overflow-hidden flex flex-col items-center justify-center font-sans`}>
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="max-w-full h-full relative transform scale-90 transition-all duration-300" style={{ width: `${containerWidth}px` }}>
          <VisualizerCanvas 
            isListening={isListening} 
            getMetrics={getMetrics} 
            mode={mode} 
            theme={theme}
            sensitivity={sensitivity} 
            color={color}
            palette={VISUALIZER_COLORS}
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

      {showPhoneFrame && !imageError && (
        <img key={currentPhoneFrame} src={currentPhoneFrame} alt="Phone Frame" referrerPolicy="no-referrer" onError={() => setImageError(true)} className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-auto z-20 pointer-events-none" />
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
        isListening={isListening} 
        isSimulated={isSimulated}
        onToggleListening={isListening ? stop : () => start(true)} 
        mode={mode} onModeChange={setMode}
        theme={theme} onThemeToggle={toggleTheme}
        sensitivity={sensitivity} onSensitivityChange={setSensitivity} verticalShift={verticalShift} onVerticalShiftChange={setVerticalShift}
        containerWidth={containerWidth} onContainerWidthChange={setContainerWidth} rms={currentRms * sensitivity}
        colors={VISUALIZER_COLORS} selectedColor={color} onColorChange={setColor}
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