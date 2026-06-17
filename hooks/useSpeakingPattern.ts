import { useRef, useEffect, useState } from 'react';

/**
 * useSpeakingAudio
 *
 * Plays `/speaking-audio.mp3` through the Web Audio API and maps its
 * real-time RMS amplitude to a scale value in [0.9 → 1.1].
 *
 * Envelope follower behaviour:
 *  - Fast attack  : quickly tracks rising audio energy (ease-out feel on scale-up)
 *  - Slow release : decays gradually when audio drops (natural tail-off)
 *
 * When `active` is false the audio is paused, the analyser loop stops, and
 * the scale is returned as 1.0.
 */

const AUDIO_SRC = '/speaking-audio.mp3';

const SCALE_MIN  = 0.9;
const SCALE_MAX  = 1.1;
const SCALE_RANGE = SCALE_MAX - SCALE_MIN; // 0.2

// Envelope follower coefficients (applied every rAF ~16 ms)
const ATTACK_RATE  = 0.18; // fraction to close per frame on the way up
const RELEASE_RATE = 0.04; // fraction to close per frame on the way down

// Normalise raw RMS (0..1 from Web Audio) into a 0..1 driving signal.
// Speech peaks typically land around 0.05–0.25; this ceiling captures that range.
const RMS_CEILING = 0.22;

export function useSpeakingAudio(active: boolean): number {
  const [scale, setScale] = useState<number>(1.0);

  // Persistent refs — survive re-renders without re-running the effect
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const audioElRef    = useRef<HTMLAudioElement | null>(null);
  const sourceRef     = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const rafRef        = useRef<number>(0);
  const envelopeRef   = useRef<number>(0); // 0..1 smoothed driving signal

  useEffect(() => {
    if (!active) {
      // ---- Pause & clean up the animation loop --------------------------------
      cancelAnimationFrame(rafRef.current);
      audioElRef.current?.pause();
      envelopeRef.current = 0;
      setScale(1.0);
      return;
    }

    // ---- One-time Audio setup (reused across active toggles) ----------------
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (!audioElRef.current) {
      const el = new Audio(AUDIO_SRC);
      el.loop  = true;
      el.crossOrigin = 'anonymous';
      audioElRef.current = el;
    }

    if (!sourceRef.current && audioElRef.current) {
      const src = ctx.createMediaElementSource(audioElRef.current);
      sourceRef.current = src;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0; // we do our own smoothing
      src.connect(analyser);
      analyser.connect(ctx.destination); // pass audio to speakers
      analyserRef.current = analyser;
    }

    // Start playback
    audioElRef.current?.play().catch(() => {
      // Autoplay blocked — audio will start on next user gesture
    });

    // ---- rAF loop -----------------------------------------------------------
    const timeDomainBuf = new Float32Array(analyserRef.current!.fftSize);

    const tick = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;

      // Compute RMS from time-domain samples
      analyser.getFloatTimeDomainData(timeDomainBuf);
      let sumSq = 0;
      for (let i = 0; i < timeDomainBuf.length; i++) {
        sumSq += timeDomainBuf[i] * timeDomainBuf[i];
      }
      const rms = Math.sqrt(sumSq / timeDomainBuf.length);

      // Normalise to 0..1 driving signal
      const target = Math.min(rms / RMS_CEILING, 1.0);

      // Envelope follower: fast attack, slow release
      const rate = target > envelopeRef.current ? ATTACK_RATE : RELEASE_RATE;
      envelopeRef.current += (target - envelopeRef.current) * rate;

      // Map envelope [0..1] → scale [0.9..1.1]
      const newScale = SCALE_MIN + envelopeRef.current * SCALE_RANGE;
      setScale(newScale);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return scale;
}
