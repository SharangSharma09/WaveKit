import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import OrbCanvas from './OrbCanvas';
import Controls from './Controls';
import { VisualizerMode, Theme } from '../types';
import { DS, getThemeColor } from '../styles/designSystem';
import { ArrowLeft, Mic, Volume2 } from 'lucide-react';
import { useSpeakingAudio } from '../hooks/useSpeakingPattern';

// ---- Color Families --------------------------------------------------------
type ColorFamily = {
  hex: string;
  bot: [number, number, number];
  midB: [number, number, number];
  midT: [number, number, number];
  top: [number, number, number];
};

const ORB_COLOR_FAMILIES: Record<string, ColorFamily> = {
  BLUE: {
    hex: '#5E8FFF',
    bot: [0.3686, 0.5608, 1.0000],
    midB: [0.3412, 0.8000, 1.0000],
    midT: [0.9843, 0.9843, 0.9843],
    top: [0.8706, 0.9608, 0.9961]
  },
  GREEN: {
    hex: '#96E6A1',
    bot: [0.5882, 0.9020, 0.6314],
    midB: [0.8314, 0.9882, 0.4745],
    midT: [0.9843, 0.9843, 0.9843],
    top: [0.9647, 1.0000, 0.8902]
  },
  YELLOW: {
    hex: '#F7797D',
    bot: [0.9686, 0.4745, 0.4902],
    midB: [0.9843, 0.8431, 0.5255],
    midT: [0.9686, 0.9451, 0.8863],
    top: [0.7765, 1.0000, 0.8667]
  },
  PINK: {
    hex: '#FF5E8F',
    bot: [1.0000, 0.3686, 0.5608],
    midB: [1.0000, 0.5333, 0.8314],
    midT: [0.9843, 0.9843, 0.9843],
    top: [0.9961, 0.8980, 0.9608]
  },
  PURPLE: {
    hex: '#9B5EFF',
    bot: [0.6078, 0.3686, 1.0000],
    midB: [0.8000, 0.5333, 1.0000],
    midT: [0.9843, 0.9843, 0.9843],
    top: [0.9490, 0.8980, 0.9961]
  },
  GREY: {
    hex: '#7A8490',
    bot: [0.4784, 0.5176, 0.5647],
    midB: [0.7216, 0.7686, 0.8000],
    midT: [0.9843, 0.9843, 0.9843],
    top: [0.9412, 0.9490, 0.9569]
  }
};

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}

function hexToRgbaStr(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function closestFamily(pickedHex: string): ColorFamily {
  const [r1, g1, b1] = hexToRgb(pickedHex);
  let closest = ORB_COLOR_FAMILIES.BLUE;
  let minDistance = Infinity;

  for (const family of Object.values(ORB_COLOR_FAMILIES)) {
    const [r2, g2, b2] = hexToRgb(family.hex);
    const distance = Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2);
    if (distance < minDistance) {
      minDistance = distance;
      closest = family;
    }
  }

  return closest;
}

const SAMPLE_CAPTION_TEXT = "This is a demonstration of real-time captions appearing word by word. As you speak into the microphone, the application listens to your voice and transcribes the words instantly. The orb visualization reacts dynamically to the audio input. You can toggle between listening mode and speaking mode to see how the system behaves. Closed captions are designed to fit perfectly within this three-line layout, wrapping automatically and starting from the top when the space is filled.";
const SAMPLE_WORDS = SAMPLE_CAPTION_TEXT.split(" ");

interface OrbPageProps {
  onBack: () => void;
  /** Optional: driven externally by AI speech state. If provided, overrides the internal dev toggle. */
  isSpeaking?: boolean;
}

const OrbPage: React.FC<OrbPageProps> = ({ onBack, isSpeaking: isSpeakingExternal }) => {
  const { isListening, isSimulated, start, stop, getMetrics, error } = useAudioAnalyzer();

  const handleToggleSimulation = () => {
    if (isSimulated) {
      stop();
    } else {
      start(true);
    }
  };

  type OrbPreset = {
    sensitivity: number;
    orbNoise: number;
    orbBlur: number;
    orbSpeed: number;
    orbNoiseScale: number;
    orbWarpStrength: number;
    orbVerticalBias: number;
    orbSaturation: number;
    orbContrast: number;
    orbForwardOnly: boolean;
  };

  const PRESETS: OrbPreset[] = [
    {
      // Preset 1: Previous Default
      sensitivity: 2.0,
      orbNoise: 0.8,
      orbBlur: 0.8,
      orbSpeed: 0.2,
      orbNoiseScale: 0.6,
      orbWarpStrength: 1.0,
      orbVerticalBias: 0.6,
      orbSaturation: 1.0,
      orbContrast: 1.0,
      orbForwardOnly: false,
    },
    {
      // Preset 2: Screenshot Settings
      sensitivity: 2.0,
      orbNoise: 0.8,
      orbBlur: 0.6,
      orbSpeed: 0.4,
      orbNoiseScale: 0.6,
      orbWarpStrength: 0.6,
      orbVerticalBias: 0.6,
      orbSaturation: 1.5,
      orbContrast: 1.0,
      orbForwardOnly: true,
    },
    {
      // Preset 3: User's New Screenshot
      sensitivity: 3.8,
      orbNoise: 0.1,
      orbBlur: 0.6,
      orbSpeed: 0.8,
      orbNoiseScale: 0.6,
      orbWarpStrength: 0.6,
      orbVerticalBias: 0.6,
      orbSaturation: 1.5,
      orbContrast: 1.0,
      orbForwardOnly: true,
    }
  ];

  // ---- Core orb state (wired to Controls) ----------------------------------
  const [sensitivity, setSensitivity]         = useState(PRESETS[0].sensitivity);
  const [orbNoise, setOrbNoise]               = useState(PRESETS[0].orbNoise);
  const [orbBlur, setOrbBlur]                 = useState(PRESETS[0].orbBlur);
  const [orbSpeed, setOrbSpeed]               = useState(PRESETS[0].orbSpeed);
  const [orbNoiseScale, setOrbNoiseScale]     = useState(PRESETS[0].orbNoiseScale);
  const [orbWarpStrength, setOrbWarpStrength] = useState(PRESETS[0].orbWarpStrength);
  const [orbVerticalBias, setOrbVerticalBias] = useState(PRESETS[0].orbVerticalBias);
  const [orbSaturation, setOrbSaturation]     = useState(PRESETS[0].orbSaturation);
  const [orbContrast, setOrbContrast]         = useState(PRESETS[0].orbContrast);
  const [orbForwardOnly, setOrbForwardOnly]   = useState(PRESETS[0].orbForwardOnly);
  const [theme] = useState<Theme>(Theme.DARK);
  const [currentRms, setCurrentRms]           = useState(0);
  const [selectedPreset, setSelectedPreset]   = useState(1);

  // ---- Speaking mode -------------------------------------------------------
  // Internal dev toggle — overridden by the optional external isSpeaking prop
  const [isSpeakingInternal, setIsSpeakingInternal] = useState(false);
  const speakingActive = isSpeakingExternal ?? isSpeakingInternal;
  const speakingScale  = useSpeakingAudio(speakingActive);
  // Slow the fluid animation in speaking mode to feel more focused/calm
  const effectiveOrbSpeed = speakingActive ? orbSpeed * 0.35 : orbSpeed;

  const handlePresetSelect = (index: number) => {
    setSelectedPreset(index);
    const p = PRESETS[index - 1];
    setSensitivity(p.sensitivity);
    setOrbNoise(p.orbNoise);
    setOrbBlur(p.orbBlur);
    setOrbSpeed(p.orbSpeed);
    setOrbNoiseScale(p.orbNoiseScale);
    setOrbWarpStrength(p.orbWarpStrength);
    setOrbVerticalBias(p.orbVerticalBias);
    setOrbSaturation(p.orbSaturation);
    setOrbContrast(p.orbContrast);
    setOrbForwardOnly(p.orbForwardOnly);
  };

  // ---- Stub state for Controls props that don't affect the orb -------------
  // (Controls.tsx is reused as-is; irrelevant sliders simply have no effect)
  const [containerWidth, setContainerWidth] = useState(500);
  const [verticalShift]  = useState(0);
  const [selectedColor, setSelectedColor] = useState('#5E8FFF');
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const [orbColorBot, setOrbColorBot]   = useState<[number, number, number]>(ORB_COLOR_FAMILIES.BLUE.bot);
  const [orbColorMidB, setOrbColorMidB] = useState<[number, number, number]>(ORB_COLOR_FAMILIES.BLUE.midB);
  const [orbColorMidT, setOrbColorMidT] = useState<[number, number, number]>(ORB_COLOR_FAMILIES.BLUE.midT);
  const [orbColorTop, setOrbColorTop]   = useState<[number, number, number]>(ORB_COLOR_FAMILIES.BLUE.top);

  useEffect(() => {
    const family = closestFamily(selectedColor);
    setOrbColorBot(family.bot);
    setOrbColorMidB(family.midB);
    setOrbColorMidT(family.midT);
    setOrbColorTop(family.top);
  }, [selectedColor]);

  // ---- Word-by-word captions state and real-time transcription logic -------
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [speechRecognitionFailed, setSpeechRecognitionFailed] = useState(false);
  const wordIndexRef = useRef(0);
  const lastWordCountRef = useRef(0);
  const captionRef = useRef<HTMLParagraphElement>(null);

  // Handle Speech Recognition or Simulated Captions Loop
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // Explicitly check browser support
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
    }

    // Fall back to simulation if browser is unsupported, mic is simulated, speech failed, or we aren't listening
    const useSimulation = !SpeechRecognition || isSimulated || !isListening || speechRecognitionFailed;
    console.log(`SpeechRecognition effect: isListening=${isListening}, captionsEnabled=${captionsEnabled}, isSimulated=${isSimulated}, speechRecognitionFailed=${speechRecognitionFailed}, useSimulation=${useSimulation}`);

    if (useSimulation) {
      if (!isListening || !captionsEnabled) {
        return;
      }

      console.log("Starting simulated caption interval...");
      const interval = setInterval(() => {
        setDisplayedWords((prev) => {
          const nextWord = SAMPLE_WORDS[wordIndexRef.current % SAMPLE_WORDS.length];
          wordIndexRef.current = wordIndexRef.current + 1;
          return [...prev, nextWord];
        });
      }, 280); // ~280ms per word

      return () => {
        console.log("Clearing simulated caption interval.");
        clearInterval(interval);
      };
    }

    // Real-time voice transcription using native browser Speech Recognition
    if (!captionsEnabled) {
      return;
    }

    let recognition: any;
    try {
      console.log("Initializing Web Speech Recognition...");
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log("Speech Recognition session started successfully.");
      };

      recognition.onresult = (event: any) => {
        let speechToText = '';
        for (let i = 0; i < event.results.length; i++) {
          speechToText += event.results[i][0].transcript + ' ';
        }

        const allWords = speechToText.trim().split(/\s+/).filter(Boolean);
        const lastProcessedCount = lastWordCountRef.current;
        console.log(`Speech Recognition result received. Word count: ${allWords.length}, previously processed: ${lastProcessedCount}`);

        if (allWords.length > lastProcessedCount) {
          const newWords = allWords.slice(lastProcessedCount);
          lastWordCountRef.current = allWords.length;
          console.log("Appending new transcribed words:", newWords);
          setDisplayedWords((prev) => [...prev, ...newWords]);
        }
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition error callback:", err.error, err.message || '');
        // Set speechRecognitionFailed to true on connection or block errors to fallback immediately
        console.warn("Speech Recognition failed with network/permission block. Falling back to simulated captions.");
        setSpeechRecognitionFailed(true);
      };

      recognition.onend = () => {
        console.log("Speech Recognition session ended.");
        // Auto-restart if we are still active and transcribing and didn't fail
        if (isListening && captionsEnabled && !speechRecognitionFailed) {
          try {
            console.log("Attempting to auto-restart Speech Recognition...");
            recognition.start();
          } catch (e) {
            // SpeechRecognition already running
          }
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start Speech Recognition:", e);
      setSpeechRecognitionFailed(true);
    }

    return () => {
      if (recognition) {
        console.log("Cleaning up and stopping Speech Recognition.");
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, [isListening, captionsEnabled, isSimulated, speechRecognitionFailed]);

  // Reset words when user stops listening
  useEffect(() => {
    if (!isListening) {
      console.log("Listening stopped, resetting captions state.");
      setDisplayedWords([]);
      wordIndexRef.current = 0;
      lastWordCountRef.current = 0;
      setSpeechRecognitionFailed(false); // Clear failure state for next turn
    }
  }, [isListening]);

  // Measure scroll height to limit text to maximum of 3 lines (72px at 24px line-height, plus 24px top padding = 96px)
  useLayoutEffect(() => {
    if (captionRef.current) {
      const el = captionRef.current;
      if (el.scrollHeight > 98 && displayedWords.length > 1) {
        const lastWord = displayedWords[displayedWords.length - 1];
        setDisplayedWords([lastWord]);
      }
    }
  }, [displayedWords]);

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

  const activePalette = ['#5E8FFF', '#96E6A1', '#F7797D', '#FF5E8F', '#9B5EFF', '#7A8490'];

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

        <div className="flex items-center gap-3">
          {/* Dev toggle — switch between Listening and Speaking mode */}
          {isSpeakingExternal === undefined && (
            <button
              onClick={() => setIsSpeakingInternal(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-widest transition-colors ${
                speakingActive
                  ? 'border-sky-500/60 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20'
                  : 'border-[#37373B] text-[#71717a] hover:text-white hover:border-white/30'
              }`}
            >
              {speakingActive
                ? <><Volume2 size={10} /> Speaking</>
                : <><Mic size={10} /> Listening</>
              }
            </button>
          )}

          <div className="flex items-center gap-2">
            <h1 className="text-white/80 text-[13px] font-bold uppercase tracking-widest">
              Orb
            </h1>
            <span className="px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-500 text-[9px] font-bold uppercase tracking-widest">
              BETA
            </span>
          </div>
        </div>
      </div>

      {/* ---- Main 12-column grid layout ------------------------------------------- */}
      <div className="flex-1 grid grid-cols-12 min-h-0 relative z-30 w-full">
        
        {/* ---- Left Column: Controls (4 cols, offset by 2) -------------------- */}
        <div className="col-start-3 col-span-4 flex justify-center py-6 px-4 overflow-y-auto custom-scrollbar">
          <div className="w-full flex flex-col gap-8">
            {/* Preset ButtonGrid */}
            <div className="w-full flex flex-col gap-3">
              <span className={`${DS.typography.sectionHeader} ${theme === Theme.DARK ? DS.colors.dark.textPrimary : DS.colors.light.textPrimary}`}>Saved Presets</span>
              <div className="flex flex-wrap gap-3 w-full">
                {PRESETS.map((_, index) => {
                  const n = index + 1;
                  return (
                    <button
                      key={`preset-${n}`}
                      type="button"
                      onClick={() => handlePresetSelect(n)}
                      className={`w-[72px] h-[72px] shrink-0 rounded-lg ${DS.stroke.button} flex items-center justify-center ${DS.typography.preset} transition-all ${theme === Theme.DARK
                        ? selectedPreset === n
                          ? `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textPrimary} ${DS.colors.dark.outlineSelected}`
                          : `${DS.colors.dark.bgPanel} ${DS.colors.dark.border} ${DS.colors.dark.textSecondary} ${DS.colors.dark.textHoverPrimary}`
                        : selectedPreset === n
                          ? `${DS.colors.light.bgPanel} border-zinc-600 ${DS.colors.light.textPrimary} ${DS.colors.light.outlineSelected}`
                          : `${DS.colors.light.bgPanel} ${DS.colors.light.border} ${DS.colors.light.textSecondary} ${DS.colors.light.textHoverPrimary}`
                        }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

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
              src="/iphone-orb.png?v=3" 
              alt="iPhone Mockup" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
            />
            {captionsEnabled ? (
              /* Bottom-aligned wrapper for the three divs when captions are ON */
              <div className="absolute bottom-0 left-0 w-full z-20 flex flex-col pointer-events-none">
                {/* Orb div - 200px height (at the top of the stack) */}
                <div 
                  className="relative w-full flex items-center justify-center" 
                  style={{ height: 200 }}
                >
                  <div
                    className="flex items-center justify-center pointer-events-none"
                    style={{ transform: `scale(${speakingScale})` }}
                  >
                    <OrbCanvas
                      isListening={isListening}
                      getMetrics={getMetrics}
                      sensitivity={sensitivity}
                      orbNoise={orbNoise}
                      orbBlur={orbBlur}
                      orbSpeed={effectiveOrbSpeed}
                      orbNoiseScale={orbNoiseScale}
                      orbWarpStrength={orbWarpStrength}
                      orbVerticalBias={orbVerticalBias}
                      orbSaturation={orbSaturation}
                      orbContrast={orbContrast}
                      orbForwardOnly={orbForwardOnly}
                      orbColorBot={orbColorBot}
                      orbColorMidB={orbColorMidB}
                      orbColorMidT={orbColorMidT}
                      orbColorTop={orbColorTop}
                      size={170} // 170px canvas with 0.44 radius = ~150px visual orb
                    />
                  </div>
                </div>

                {/* captions div - 120px height (in the middle, top-aligned) */}
                <div 
                  className="relative w-full flex justify-center" 
                  style={{ height: 120 }}
                >
                  {displayedWords.length > 0 && (
                    <p
                      ref={captionRef}
                      className="text-white text-left font-normal leading-[24px]"
                      style={{
                        width: 260,
                        paddingTop: 24,
                        fontSize: '15px',
                        fontFamily: 'Roboto, sans-serif',
                        maxHeight: 96,
                        overflow: 'hidden',
                        opacity: 0.8,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {displayedWords.join(' ')}
                    </p>
                  )}
                </div>

                {/* Vad div - 262px height (at the bottom of the stack) */}
                <div 
                  className="relative w-full pointer-events-auto" 
                  style={{ height: 262 }}
                >
                  {/* Captions button: 48x48px, circular, bottom-left aligned */}
                  <button
                    type="button"
                    className="absolute flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 bg-white text-black"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      bottom: 50, 
                      left: 50 
                    }}
                    onClick={() => setCaptionsEnabled(false)}
                    aria-label="Toggle captions"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1z" />
                    </svg>
                  </button>

                  {/* Microphone button: 48x48px, circular, white background, black icon */}
                  <button
                    type="button"
                    className="absolute flex items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      bottom: 50, 
                      right: 50 
                    }}
                    onClick={() => {
                      if (speakingActive) {
                        setIsSpeakingInternal(false);
                        start(true);
                      } else {
                        setIsSpeakingInternal(true);
                        stop();
                      }
                    }}
                    aria-label={speakingActive ? "Unmute microphone (Switch to Listening)" : "Mute microphone (Switch to AI Speaking)"}
                  >
                    {speakingActive ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                        {/* Solid Microphone Base */}
                        <g fill="currentColor">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </g>
                        {/* Clean diagonal slash with white backing to create a gap */}
                        <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Centered Orb and bottom-aligned Vad div when captions are OFF */
              <>
                {/* The Orb perfectly centered inside the frame - z-20 brings it to front */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate(-50%, -50%) scale(${speakingScale})` }}
                >
                  <OrbCanvas
                    isListening={isListening}
                    getMetrics={getMetrics}
                    sensitivity={sensitivity}
                    orbNoise={orbNoise}
                    orbBlur={orbBlur}
                    orbSpeed={effectiveOrbSpeed}
                    orbNoiseScale={orbNoiseScale}
                    orbWarpStrength={orbWarpStrength}
                    orbVerticalBias={orbVerticalBias}
                    orbSaturation={orbSaturation}
                    orbContrast={orbContrast}
                    orbForwardOnly={orbForwardOnly}
                    orbColorBot={orbColorBot}
                    orbColorMidB={orbColorMidB}
                    orbColorMidT={orbColorMidT}
                    orbColorTop={orbColorTop}
                    size={170} // 170px canvas with 0.44 radius = ~150px visual orb
                  />
                </div>

                {/* Vad div - 262px height (at the bottom) */}
                <div 
                  className="absolute bottom-0 left-0 w-full z-20 pointer-events-auto" 
                  style={{ height: 262 }}
                >
                  {/* Captions button: 48x48px, circular, bottom-left aligned */}
                  <button
                    type="button"
                    className="absolute flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 bg-[#8C94AE] text-white"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      bottom: 50, 
                      left: 50 
                    }}
                    onClick={() => setCaptionsEnabled(true)}
                    aria-label="Toggle captions"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1z" />
                    </svg>
                  </button>

                  {/* Microphone button: 48x48px, circular, white background, black icon */}
                  <button
                    type="button"
                    className="absolute flex items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    style={{ 
                      width: 48, 
                      height: 48, 
                      bottom: 50, 
                      right: 50 
                    }}
                    onClick={() => {
                      if (speakingActive) {
                        setIsSpeakingInternal(false);
                        start(true);
                      } else {
                        setIsSpeakingInternal(true);
                        stop();
                      }
                    }}
                    aria-label={speakingActive ? "Unmute microphone (Switch to Listening)" : "Mute microphone (Switch to AI Speaking)"}
                  >
                    {speakingActive ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
                        {/* Solid Microphone Base */}
                        <g fill="currentColor">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </g>
                        {/* Clean diagonal slash with white backing to create a gap */}
                        <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default OrbPage;
