import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import OrbCanvas from './OrbCanvas';
import Controls from './Controls';
import { VisualizerMode, Theme } from '../types';
import { DS, getThemeColor } from '../styles/designSystem';
import { ArrowLeft } from 'lucide-react';

interface OrbPageProps {
  onBack: () => void;
}

const OrbPage: React.FC<OrbPageProps> = ({ onBack }) => {
  const { isListening, isSimulated, start, stop, getMetrics, error } = useAudioAnalyzer();

  const handleToggleSimulation = () => {
    if (isSimulated) {
      stop();
    } else {
      start(true);
    }
  };

  // ---- Core orb state (wired to Controls) ----------------------------------
  const [sensitivity, setSensitivity]         = useState(2.0);
  const [orbNoise, setOrbNoise]               = useState(0.8);
  const [orbBlur, setOrbBlur]                 = useState(0.8);
  const [orbSpeed, setOrbSpeed]               = useState(0.2);
  const [orbNoiseScale, setOrbNoiseScale]     = useState(0.6);
  const [orbWarpStrength, setOrbWarpStrength] = useState(1.0);
  const [orbVerticalBias, setOrbVerticalBias] = useState(0.6);
  const [orbSaturation, setOrbSaturation]     = useState(1.0);
  const [orbContrast, setOrbContrast]         = useState(1.0);
  const [orbForwardOnly, setOrbForwardOnly]   = useState(false);
  const [theme] = useState<Theme>(Theme.DARK);
  const [currentRms, setCurrentRms]           = useState(0);

  // ---- Stub state for Controls props that don't affect the orb -------------
  // (Controls.tsx is reused as-is; irrelevant sliders simply have no effect)
  const [containerWidth, setContainerWidth] = useState(500);
  const [verticalShift]  = useState(0);
  const [selectedColor, setSelectedColor] = useState(DS.palettes.dark[0]);

  // Envelope stubs
  const [envelopeAmplitude, setEnvelopeAmplitude] = useState(40);
  const [envelopeSpeed, setEnvelopeSpeed]         = useState(1);
  const [envelopePoints, setEnvelopePoints]       = useState(20);
  const [envelopeFillOpacity, setEnvelopeFillOpacity] = useState(20);

  // Wave stubs
  const [waveAmplitude, setWaveAmplitude] = useState(150);
  const [waveNoise, setWaveNoise]         = useState(20);

  // Bars stubs
  const [numWaves, setNumWaves]     = useState(10);
  const [barWidth, setBarWidth]     = useState(32);
  const [barSpacing, setBarSpacing] = useState(10);
  const [barAmplitude, setBarAmplitude] = useState(100);

  // Sino stubs
  const [sinoAmplitude, setSinoAmplitude]   = useState(40);
  const [sinoWavelength, setSinoWavelength] = useState(300);
  const [sinoSpeed, setSinoSpeed]           = useState(1);

  // Spring stubs
  const [springStrands, setSpringStrands]     = useState(3);
  const [springAmplitude, setSpringAmplitude] = useState(60);

  // Paper stubs
  const [paperAmount, setPaperAmount]             = useState(12);
  const [paperWaves, setPaperWaves]               = useState(3);
  const [paperPoints, setPaperPoints]             = useState(10);
  const [paperIdleAmplitude, setPaperIdleAmplitude] = useState(2);
  const [paperStrokeWidth, setPaperStrokeWidth]   = useState(6);
  const [paperWaveColors, setPaperWaveColors]     = useState<string[]>(DS.palettes.paper);

  const activePalette = DS.palettes.dark;

  // ---- Auto-start mic ------------------------------------------------------
  useEffect(() => {
    let started = false;
    const attempt = async () => {
      if (started || isListening) return;
      try { await start(true); started = true; removeListeners(); }
      catch { /* wait for gesture */ }
    };
    const removeListeners = () => {
      window.removeEventListener('click', attempt);
      window.removeEventListener('touchstart', attempt);
    };
    attempt();
    window.addEventListener('click', attempt, { once: true });
    window.addEventListener('touchstart', attempt, { once: true });
    return () => removeListeners();
  }, [isListening, start]);

  // ---- RMS polling for Controls meter ------------------------------------
  useEffect(() => {
    let raf: number;
    const update = () => {
      setCurrentRms(isListening ? getMetrics().rms : 0);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [isListening, getMetrics]);

  return (
    <div className="relative w-full h-screen bg-[#0A0A0A] overflow-hidden flex flex-col font-sans select-none">

      {/* ---- Top bar -------------------------------------------------------- */}
      <div className="shrink-0 w-full flex items-center justify-between px-6 pt-5 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Back to Editor
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-white/80 text-[13px] font-bold uppercase tracking-widest">
            Orb
          </h1>
          <span className="px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
            BETA
          </span>
        </div>
      </div>

      {/* ---- Main 12-column grid layout ------------------------------------------- */}
      <div className="flex-1 grid grid-cols-12 min-h-0 relative z-30 w-full">
        
        {/* ---- Left Column: Controls (4 cols, offset by 2) -------------------- */}
        <div className="col-start-3 col-span-4 flex justify-center py-6 px-4 overflow-y-auto custom-scrollbar">
          <div className="w-full">
            <Controls
              isListening={isListening}
              isSimulated={isSimulated}
              onToggleListening={isListening ? stop : () => start(true)}
              onToggleSimulation={handleToggleSimulation}

              // Mode set to ORB — Controls renders no mode-specific sliders for it
              mode={VisualizerMode.ORB}
              onModeChange={() => {}}

              theme={theme}
              onThemeToggle={() => {}}

              // Sensitivity is the only slider that actively drives the orb
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}

              orbNoise={orbNoise}
              onOrbNoiseChange={setOrbNoise}

              orbBlur={orbBlur}
              onOrbBlurChange={setOrbBlur}

              orbSpeed={orbSpeed}
              onOrbSpeedChange={setOrbSpeed}

              orbNoiseScale={orbNoiseScale}
              onOrbNoiseScaleChange={setOrbNoiseScale}

              orbWarpStrength={orbWarpStrength}
              onOrbWarpStrengthChange={setOrbWarpStrength}

              orbVerticalBias={orbVerticalBias}
              onOrbVerticalBiasChange={setOrbVerticalBias}

              orbSaturation={orbSaturation}
              onOrbSaturationChange={setOrbSaturation}

              orbContrast={orbContrast}
              onOrbContrastChange={setOrbContrast}

              orbForwardOnly={orbForwardOnly}
              onOrbForwardOnlyChange={setOrbForwardOnly}

              rms={currentRms * sensitivity}

              // Position / layout stubs (no-op for orb)
              verticalShift={verticalShift}
              onVerticalShiftChange={() => {}}
              containerWidth={containerWidth}
              onContainerWidthChange={setContainerWidth}

              // Colour stubs
              colors={activePalette}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}

              // Envelope stubs
              envelopeAmplitude={envelopeAmplitude}
              onEnvelopeAmplitudeChange={setEnvelopeAmplitude}
              envelopeSpeed={envelopeSpeed}
              onEnvelopeSpeedChange={setEnvelopeSpeed}
              envelopePoints={envelopePoints}
              onEnvelopePointsChange={setEnvelopePoints}
              envelopeFillOpacity={envelopeFillOpacity}
              onEnvelopeFillOpacityChange={setEnvelopeFillOpacity}

              // Wave stubs
              waveAmplitude={waveAmplitude}
              onWaveAmplitudeChange={setWaveAmplitude}
              waveNoise={waveNoise}
              onWaveNoiseChange={setWaveNoise}

              // Bars stubs
              numWaves={numWaves}
              onNumWavesChange={setNumWaves}
              barWidth={barWidth}
              onBarWidthChange={setBarWidth}
              barSpacing={barSpacing}
              onBarSpacingChange={setBarSpacing}
              barAmplitude={barAmplitude}
              onBarAmplitudeChange={setBarAmplitude}

              // Sino stubs
              sinoAmplitude={sinoAmplitude}
              onSinoAmplitudeChange={setSinoAmplitude}
              sinoWavelength={sinoWavelength}
              onSinoWavelengthChange={setSinoWavelength}
              sinoSpeed={sinoSpeed}
              onSinoSpeedChange={setSinoSpeed}

              // Spring stubs
              springStrands={springStrands}
              onSpringStrandsChange={setSpringStrands}
              springAmplitude={springAmplitude}
              onSpringAmplitudeChange={setSpringAmplitude}

              // Paper stubs
              paperAmount={paperAmount}
              onPaperAmountChange={setPaperAmount}
              paperWaves={paperWaves}
              onPaperWavesChange={setPaperWaves}
              paperPoints={paperPoints}
              onPaperPointsChange={setPaperPoints}
              paperIdleAmplitude={paperIdleAmplitude}
              onPaperIdleAmplitudeChange={setPaperIdleAmplitude}
              paperStrokeWidth={paperStrokeWidth}
              onPaperStrokeWidthChange={setPaperStrokeWidth}
              paperWaveColors={paperWaveColors}
              onPaperWaveColorChange={(i, c) => {
                setPaperWaveColors(prev => {
                  const next = [...prev];
                  next[i] = c;
                  return next;
                });
              }}

              // Utility stubs
              showPhoneFrame={false}
              onTogglePhoneFrame={() => {}}
              onOpenExport={() => {}}
              onOpenFullscreenPreview={() => {}}
            />
          </div>
        </div>

        {/* ---- Right Column: iPhone Mockup (4 cols) --------------------------- */}
        <div className="col-start-7 col-span-4 flex items-center justify-center py-6 px-4 border-l border-white/5 relative bg-black/40">
          <div
            className="relative overflow-hidden"
            style={{ 
              width: '100%', 
              maxWidth: 364, 
              aspectRatio: '1096 / 2251' 
            }}
          >
            {/* The iPhone mockup frame - z-10 so it stays behind the orb */}
            <img 
              src="/iphone-orb.png" 
              alt="iPhone Mockup" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />
            {/* The Orb perfectly centered inside the frame - z-20 brings it to front */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none">
              {/* Subtle ambient background glow behind the orb */}
              <div
                className="absolute inset-0 pointer-events-none -z-10 scale-150"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, rgba(80,140,255,0.12) 0%, transparent 70%)',
                }}
              />
              <OrbCanvas
                isListening={isListening}
                getMetrics={getMetrics}
                sensitivity={sensitivity}
                orbNoise={orbNoise}
                orbBlur={orbBlur}
                orbSpeed={orbSpeed}
                orbNoiseScale={orbNoiseScale}
                orbWarpStrength={orbWarpStrength}
                orbVerticalBias={orbVerticalBias}
                orbSaturation={orbSaturation}
                orbContrast={orbContrast}
                orbForwardOnly={orbForwardOnly}
                size={170} // 170px canvas with 0.44 radius = ~150px visual orb
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrbPage;
