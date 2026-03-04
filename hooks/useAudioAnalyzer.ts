import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioMetrics } from '../types';

interface UseAudioAnalyzerReturn {
  isListening: boolean;
  isSimulated: boolean;
  start: (allowSimulated?: boolean) => Promise<void>;
  stop: () => void;
  getMetrics: () => AudioMetrics;
  error: string | null;
}

export const useAudioAnalyzer = (): UseAudioAnalyzerReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to maintain state without triggering re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | OscillatorNode | null>(null);

  // Data buffers
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0));
  const timeDomainDataRef = useRef<Float32Array>(new Float32Array(0));
  const rmsRef = useRef<number>(0);

  // Animation Loop
  useEffect(() => {
    if (!isListening) return;

    let rafId: number;
    const update = () => {
      const analyser = analyserRef.current;
      if (analyser) {
        if (dataArrayRef.current.length !== analyser.frequencyBinCount) {
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
          timeDomainDataRef.current = new Float32Array(analyser.fftSize);
        }

        analyser.getByteFrequencyData(dataArrayRef.current);
        analyser.getFloatTimeDomainData(timeDomainDataRef.current);

        // Calculate RMS
        let sumSquares = 0;
        const data = timeDomainDataRef.current;
        const len = data.length;
        for (let i = 0; i < len; i++) {
          sumSquares += data[i] * data[i];
        }
        rmsRef.current = Math.sqrt(sumSquares / len);

        // If simulated, add some "jitter" or spectral variety to the dataArray
        if (isSimulated) {
          const time = Date.now() * 0.001;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            const freqNoise = Math.sin(time * 2 + i * 0.1) * 20 + Math.random() * 10;
            dataArrayRef.current[i] = Math.max(0, Math.min(255, dataArrayRef.current[i] + freqNoise));
          }
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isListening, isSimulated]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      if ('stop' in sourceRef.current) (sourceRef.current as OscillatorNode).stop();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend().catch(() => { });
    }
    setIsListening(false);
    setIsSimulated(false);
    rmsRef.current = 0;
  }, []);

  const start = useCallback(async (allowSimulated: boolean = true) => {
    console.log("AudioAnalyzer: Attempting to start...");
    setError(null);
    stop();

    try {
      // 1. Basic Support Checks
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!window.isSecureContext && !isLocalhost) {
        throw new Error("Microphone access requires a secure context (HTTPS or localhost).");
      }

      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      // 2. Initialize Context immediately (User Gesture turn)
      let ctx = audioContextRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioContextClass();
        audioContextRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      // 3. Request Microphone
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("navigator.mediaDevices.getUserMedia is not supported.");
        }

        console.log("AudioAnalyzer: Requesting microphone permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("AudioAnalyzer: Microphone access granted.");

        streamRef.current = stream;
        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
        setIsListening(true);
        setIsSimulated(false);
      } catch (micErr: any) {
        console.warn("AudioAnalyzer: Microphone access failed:", micErr.name || micErr.message);

        if (allowSimulated) {
          console.log("AudioAnalyzer: Falling back to simulated audio.");
          // Fallback to Synthetic Audio
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);

          // Modulate amplitude to simulate voice/music dynamics
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(2, ctx.currentTime);
          lfoGain.gain.setValueAtTime(0.5, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(gain.gain);

          gain.gain.setValueAtTime(0.2, ctx.currentTime);

          osc.connect(gain);
          gain.connect(analyser);

          osc.start();
          lfo.start();

          sourceRef.current = osc;
          setIsSimulated(true);
          setIsListening(true);
          setError("Microphone not available. Using simulated audio.");
        } else {
          throw micErr;
        }
      }

    } catch (err: any) {
      console.error("AudioAnalyzer: Initialization failed:", err);
      stop();

      let msg = "Could not access microphone.";
      const errName = err.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || err.message?.toLowerCase().includes('denied')) {
        msg = "Microphone access denied. Check site settings.";
      } else if (errName === 'NotFoundError' || err.message?.toLowerCase().includes('not found')) {
        msg = "No microphone found. connect an input device.";
      } else {
        msg = err.message || "Unknown audio error.";
      }

      setError(msg);
    }
  }, [stop]);

  const getMetrics = useCallback(() => {
    return {
      rms: rmsRef.current,
      frequencyData: dataArrayRef.current
    };
  }, []);

  return { isListening, isSimulated, start, stop, getMetrics, error };
};