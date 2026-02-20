import React, { useRef, useEffect } from 'react';
import { VisualizerMode, Theme } from '../types';

interface VisualizerCanvasProps {
  isListening: boolean;
  getMetrics: () => { rms: number; frequencyData: Uint8Array };
  mode: VisualizerMode;
  theme: Theme;
  sensitivity: number;
  color: string;
  palette: string[];
  verticalShift: number; // Percentage offset from center
  // Bar props
  numWaves: number;
  barWidth: number;
  barHeight: number;
  barSpacing: number;
  barAmplitude: number;
  barRoundness: number;
  barMoving: boolean;
  barSpeed: number;
  // Sino props
  sinoAmplitude: number;
  sinoWavelength: number;
  sinoSpeed: number;
  sinoMoving: boolean;
  // Spring Band props
  springStrands: number;
  springAmplitude: number;
  // Envelope props
  envelopeAmplitude: number;
  envelopeSpeed: number;
  envelopePoints: number;
  envelopeFillOpacity: number;
  envelopeStrokeWidth: number;
  envelopeMoving: boolean;
  // Wave props
  waveAmplitude: number;
  waveNoise: number;
  waveSpeed: number;
  waveMoving: boolean;
  // Paper Band props
  paperAmount: number;
  paperScale: number;
  paperWaves: number;
  paperPoints: number;
  paperIdleAmplitude: number;
  paperStrokeWidth: number;
  paperWaveColors: string[];
  paperMoving: boolean;
  paperSpeed: number;
  // Layout
  containerWidth: number;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

const SPRING_STRAND_COLORS = ['#40B9F8', '#8E8EFF', '#D48EFF', '#FF87D1'];

const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ 
  isListening, 
  getMetrics, 
  mode,
  theme,
  sensitivity, 
  color,
  palette,
  verticalShift,
  numWaves,
  barWidth,
  barHeight,
  barSpacing,
  barAmplitude,
  barRoundness,
  barMoving,
  barSpeed,
  sinoAmplitude,
  sinoWavelength,
  sinoSpeed,
  sinoMoving,
  springStrands,
  springAmplitude,
  envelopeAmplitude,
  envelopeSpeed,
  envelopePoints,
  envelopeFillOpacity,
  envelopeStrokeWidth,
  envelopeMoving,
  waveAmplitude,
  waveNoise,
  waveSpeed,
  waveMoving,
  paperAmount,
  paperScale,
  paperWaves,
  paperPoints,
  paperIdleAmplitude,
  paperStrokeWidth,
  paperWaveColors,
  paperMoving,
  paperSpeed,
  containerWidth
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);
  const envelopePhaseRef = useRef<number>(0);
  const paperPhaseRef = useRef<number>(0);
  const waveAccumulatorRef = useRef<number>(0);
  
  // Bars Mode State
  const barHistoryRef = useRef<number[]>([]);
  const barScrollRef = useRef<number>(0);
  
  const smoothRmsRef = useRef(0);
  const springStateRef = useRef<{ pos: number; vel: number }[]>([]);
  const paperStateRef = useRef<number[]>([]);
  const waveHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isListening) {
        drawIdle(ctx, canvas.width, canvas.height);
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      const { rms, frequencyData } = getMetrics();
      smoothRmsRef.current += (rms * sensitivity - smoothRmsRef.current) * 0.12; 
      const smoothedRms = smoothRmsRef.current;

      // Update phases for modes that should move
      if (sinoMoving) {
        phaseRef.current += sinoSpeed * 0.05;
      }
      
      if (envelopeMoving) {
        envelopePhaseRef.current += envelopeSpeed * 0.04;
      }

      if (paperMoving) {
        paperPhaseRef.current += paperSpeed * 0.04; 
      }

      switch (mode) {
        case VisualizerMode.ENVELOPE:
          drawEnvelope(ctx, canvas.width, canvas.height, smoothedRms);
          break;
        case VisualizerMode.WAVE:
          drawWave(ctx, canvas.width, canvas.height, smoothedRms);
          break;
        case VisualizerMode.BARS:
          drawBars(ctx, canvas.width, canvas.height, frequencyData, smoothedRms);
          break;
        case VisualizerMode.SINO:
          drawSino(ctx, canvas.width, canvas.height, smoothedRms);
          break;
        case VisualizerMode.SPRING_BAND:
          drawSpringBand(ctx, canvas.width, canvas.height, smoothedRms);
          break;
        case VisualizerMode.PAPER_BAND:
          drawPaperBand(ctx, canvas.width, canvas.height, frequencyData);
          break;
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isListening, mode, theme, sensitivity, color, palette, verticalShift, getMetrics, numWaves, barWidth, barHeight, barSpacing, barAmplitude, barRoundness, barMoving, barSpeed, sinoAmplitude, sinoWavelength, sinoSpeed, sinoMoving, springStrands, springAmplitude, envelopeAmplitude, envelopeSpeed, envelopePoints, envelopeFillOpacity, envelopeStrokeWidth, envelopeMoving, waveAmplitude, waveNoise, waveSpeed, waveMoving, paperAmount, paperScale, paperWaves, paperPoints, paperIdleAmplitude, paperStrokeWidth, paperWaveColors, paperMoving, paperSpeed, containerWidth]);

  const getCenterY = (height: number) => (height / 2) + (height * (verticalShift / 100));

  const drawIdle = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = getCenterY(height);
    const { r, g, b } = hexToRgb(color);
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawPaperBand = (ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array) => {
    const centerY = getCenterY(height);
    const amount = paperAmount;
    const pointsCount = paperPoints;
    
    const bands: number[] = [];
    const maxBins = Math.floor(data.length * 0.85); 
    
    for (let i = 0; i < amount; i++) {
        const base = Math.pow(maxBins, 1 / amount);
        const startBin = Math.floor(Math.pow(base, i));
        const endBin = Math.floor(Math.pow(base, i + 1));
        
        let sum = 0;
        let count = 0;
        for (let j = startBin; j <= endBin && j < data.length; j++) {
            sum += data[j];
            count++;
        }
        const avg = count > 0 ? (sum / count) / 255.0 : 0;
        const normalized = avg < 0.002 ? 0 : Math.pow(avg, 0.7);
        bands.push(normalized);
    }

    if (paperStateRef.current.length !== amount) {
        paperStateRef.current = new Array(amount).fill(0);
    }
    
    const ATTACK = 0.5;
    const RELEASE = 0.04;
    for (let i = 0; i < amount; i++) {
        const target = bands[i];
        const current = paperStateRef.current[i];
        if (target > current) {
          paperStateRef.current[i] += (target - current) * ATTACK;
        } else {
          paperStateRef.current[i] += (target - current) * RELEASE;
        }
    }

    const step = width / (pointsCount + 1);
    const time = Date.now() * 0.001;

    const drawSingleWave = (waveIndex: number) => {
        const points: { x: number, y: number }[] = [];
        points.push({ x: 0, y: centerY });

        const wavePhase = waveIndex * (Math.PI / 2);

        for (let i = 1; i <= pointsCount; i++) {
            const x = i * step;
            const t = (i - 1) / (pointsCount - 1);
            const bandIdxF = (1 - t) * (amount - 1); 
            const i0 = Math.floor(bandIdxF);
            const i1 = Math.min(i0 + 1, amount - 1);
            const frac = bandIdxF - i0;
            
            const intensity = paperStateRef.current[i0] * (1 - frac) + paperStateRef.current[i1] * frac;
            const breathing = Math.sin(time + i * 0.1) * 0.2;
            
            const voiceModulation = intensity * paperScale * sensitivity * 2.5;
            const magnitude = voiceModulation + paperIdleAmplitude;
            
            // Reversing movement: changed - paperPhaseRef.current to + paperPhaseRef.current
            const individualPhase = wavePhase + (i * 0.3) + breathing + paperPhaseRef.current;
            const yOffset = -magnitude * Math.sin(individualPhase);
            points.push({ x, y: centerY + yOffset });
        }

        points.push({ x: width, y: centerY });

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const xc = (p0.x + p1.x) / 2;
            const yc = (p0.y + p1.y) / 2;
            ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
        }

        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        
        // Use per-wave colors
        const waveColor = paperWaveColors[waveIndex % paperWaveColors.length] || palette[waveIndex % palette.length];
        const { r, g, b } = hexToRgb(waveColor);
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = paperStrokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.stroke();
        ctx.shadowBlur = 0;
    };

    for (let w = 0; w < paperWaves; w++) {
        drawSingleWave(w);
    }
  };

  const drawEnvelope = (ctx: CanvasRenderingContext2D, width: number, height: number, rms: number) => {
    const centerY = getCenterY(height);
    const { r, g, b } = hexToRgb(color);
    
    const phase = envelopePhaseRef.current;
    const amplitudeRange = 120; 
    const totalAmp = envelopeAmplitude + (rms * amplitudeRange);
    const wavelength = width * 0.8;
    const k = (Math.PI * 2) / wavelength;
    const step = width / (envelopePoints - 1);
    
    // Build path
    const upperPoints: {x: number, y: number}[] = [];
    const lowerPoints: {x: number, y: number}[] = [];

    for (let i = 0; i < envelopePoints; i++) {
      const x = i * step;
      const envelope = Math.sin((x / width) * Math.PI);
      const displacement = envelope * totalAmp * Math.sin(x * k + phase);
      upperPoints.push({ x, y: centerY - displacement });
      lowerPoints.push({ x, y: centerY + displacement });
    }

    // Draw Fill
    ctx.beginPath();
    ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
    for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
    for (let i = lowerPoints.length - 1; i >= 0; i--) ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
    ctx.closePath();

    const fillAlpha = envelopeFillOpacity / 100;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillAlpha})`;
    ctx.fill();

    // Draw solid stroke
    if (envelopeStrokeWidth > 0) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 1.0)`;
      ctx.lineWidth = envelopeStrokeWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Stroke Top
      ctx.beginPath();
      ctx.moveTo(upperPoints[0].x, upperPoints[0].y);
      for (let i = 1; i < upperPoints.length; i++) ctx.lineTo(upperPoints[i].x, upperPoints[i].y);
      ctx.stroke();

      // Stroke Bottom
      ctx.beginPath();
      ctx.moveTo(lowerPoints[0].x, lowerPoints[0].y);
      for (let i = 1; i < lowerPoints.length; i++) ctx.lineTo(lowerPoints[i].x, lowerPoints[i].y);
      ctx.stroke();

      // Glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  const drawSpringBand = (ctx: CanvasRenderingContext2D, width: number, height: number, rms: number) => {
    const centerY = getCenterY(height);
    if (springStateRef.current.length !== springStrands) {
      springStateRef.current = Array.from({ length: springStrands }, (_, i) => springStateRef.current[i] || { pos: 0, vel: 0 });
    }
    const stiffness = 0.15;
    const damping = 0.82; 
    const targetDisp = (springAmplitude * 0.4) + (rms * springAmplitude * 1.6);
    springStateRef.current.forEach((strand, i) => {
      const individualTarget = targetDisp * (1.0 + i * 0.05);
      const force = (individualTarget - strand.pos) * stiffness;
      strand.vel = (strand.vel + force) * damping;
      strand.pos += strand.vel;
    });
    const frequency = (Math.PI * 3) / width;
    springStateRef.current.forEach((strand, i) => {
      const strandColor = SPRING_STRAND_COLORS[i % SPRING_STRAND_COLORS.length];
      const { r, g, b } = hexToRgb(strandColor);
      const phaseOffset = (2 * Math.PI * i) / springStrands;
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      for (let x = 0; x <= width; x += 4) {
        const envelope = Math.sin((x / width) * Math.PI);
        const y = centerY + Math.sin(x * frequency + phaseOffset) * strand.pos * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  };

  const drawSino = (ctx: CanvasRenderingContext2D, width: number, height: number, rms: number) => {
    const centerY = getCenterY(height);
    const centerX = width / 2;
    const { r, g, b } = hexToRgb(color);
    const finalAmplitude = sinoAmplitude + (rms * 150);
    
    const phase = phaseRef.current;
    const freq = (Math.PI * 2) / sinoWavelength;
    
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    for (let x = 0; x <= width; x += 2) {
      const dist = Math.abs(x - centerX) / centerX;
      const envelope = Math.exp(-3.8 * dist * dist);
      const y = centerY + Math.sin(x * freq + phase) * finalAmplitude * envelope;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawWave = (ctx: CanvasRenderingContext2D, width: number, height: number, rms: number) => {
    const centerY = getCenterY(height);
    const { r, g, b } = hexToRgb(color);

    // Number of points in the scrolling wave
    const maxPoints = 120;
    const step = width / (maxPoints - 1);
    
    ctx.beginPath();
    ctx.lineWidth = 4 + (rms * 4);
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (waveMoving) {
      waveAccumulatorRef.current += waveSpeed;
      // Cap updates per frame to avoid freezing if speed is very high (though max 3 is safe)
      let updates = 0;
      while (waveAccumulatorRef.current >= 1 && updates < 10) {
        // Add current frame sample to history
        // We add noise based on rms and user setting
        const noiseVal = (Math.random() - 0.5) * waveNoise * (0.2 + rms);
        const signalVal = rms * waveAmplitude;
        const currentYOffset = signalVal + noiseVal;
        
        waveHistoryRef.current.push(currentYOffset);
        if (waveHistoryRef.current.length > maxPoints) {
          waveHistoryRef.current.shift();
        }
        waveAccumulatorRef.current -= 1;
        updates++;
      }

      // Draw from left to right, but since we want it to "move" right-to-left,
      // we iterate through history. Oldest is left, newest is right.
      for (let i = 0; i < waveHistoryRef.current.length; i++) {
        const x = i * step;
        // Fade out older samples slightly
        const yOffset = waveHistoryRef.current[i];
        
        const y = centerY - yOffset;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      // Live Reactive Mode (Not scrolling)
      // Generates a fresh jagged line every frame to create an electric/static effect
      for (let i = 0; i < maxPoints; i++) {
        const x = i * step;
        
        // Random jitter for the static effect
        const noise = (Math.random() - 0.5);
        
        // Magnitude based on user settings and audio input
        // waveNoise provides a baseline jitter, waveAmplitude scales with volume
        const magnitude = (waveNoise * 0.3) + (rms * Math.abs(waveAmplitude));
        
        const yOffset = noise * magnitude;
        const y = centerY + yOffset;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    
    // Optional glow for Wave
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const drawBars = (ctx: CanvasRenderingContext2D, width: number, height: number, data: Uint8Array, rms: number) => {
    const centerY = getCenterY(height);
    const { r, g, b } = hexToRgb(color);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`; 
    ctx.lineWidth = 2;

    // Calculate max radius based on width
    const maxRadius = barWidth / 2;
    const cornerRadius = (barRoundness / 100) * maxRadius;

    // Height scaling factor: Default max 50px creates a 1.25x multiplier.
    // Normalized so that 40px input ~ 1.0x scale of the previous logic.
    const heightScale = barHeight / 40;

    if (barMoving) {
        // --- SCROLLING MODE (Streaming right-to-left) ---
        const totalBarWidth = barWidth + barSpacing;
        
        // Update scroll position (pixels per frame based on speed)
        barScrollRef.current += barSpeed * 2;

        // Spawn new bar if gap is large enough
        while (barScrollRef.current >= totalBarWidth) {
            barScrollRef.current -= totalBarWidth;
            
            // Calculate height driven by current audio input (RMS) at spawn time
            const gateThreshold = 0.005;
            const isQuiet = rms < gateThreshold;
            const baseHeight = isQuiet ? 8 : 12;
            
            // Use current RMS scaled by sensitivity as the driver
            const normalizedRms = Math.min(1, rms * sensitivity * 1.5);
            const reactivity = normalizedRms * barAmplitude * 2.5; 
            const calculatedHeight = baseHeight + reactivity;
            
            // Apply new Height slider scaling
            const finalHeight = calculatedHeight * heightScale;
            
            // Add to history (Newest first)
            barHistoryRef.current.unshift(finalHeight);
        }

        // Prune history to keep only visible bars
        const maxBarsNeeded = Math.ceil(width / totalBarWidth) + 2;
        if (barHistoryRef.current.length > maxBarsNeeded) {
            barHistoryRef.current = barHistoryRef.current.slice(0, maxBarsNeeded);
        }

        // Render Bars
        // i=0 is newest (Right side). We want them to originate from right edge.
        // x = width + barSpacing - (i * totalBarWidth) - barScrollRef.current
        for (let i = 0; i < barHistoryRef.current.length; i++) {
            const h = barHistoryRef.current[i];
            const drawX = width + barSpacing - (i * totalBarWidth) - barScrollRef.current;
            const drawY = centerY - (h / 2);
            
            // Only draw if roughly onscreen
            if (drawX + barWidth > 0 && drawX < width) {
                ctx.beginPath();
                // @ts-ignore
                if (ctx.roundRect) ctx.roundRect(drawX, drawY, barWidth, h, cornerRadius);
                else ctx.rect(drawX, drawY, barWidth, h);
                ctx.fill();
                ctx.stroke();
            }
        }

    } else {
        // --- FIXED MODE (Standard Spectrum Analyzer) ---
        const totalContentWidth = (numWaves * barWidth) + ((numWaves - 1) * barSpacing);
        const startX = (width - totalContentWidth) / 2;
        const mid = (numWaves - 1) / 2;

        for (let i = 0; i < numWaves; i++) {
          const dist = Math.abs(i - mid);
          const spectrumLimit = Math.floor(data.length * 0.5); 
          const sampleIdx = Math.floor((dist / (numWaves / 2)) * spectrumLimit) % data.length;
          const rawVal = data[sampleIdx] / 255.0;
          
          const gateThreshold = 0.005;
          const isQuiet = rms < gateThreshold;
          const dampening = isQuiet ? 0 : Math.max(0, Math.min(1, (rms - gateThreshold) * 20));
          
          const val = rawVal * dampening;
          
          const baseHeight = isQuiet ? 8 : 12;
          const reactivity = (val + (isQuiet ? 0 : rms)) * barAmplitude * 2;
          const calculatedHeight = baseHeight + reactivity;

          // Apply new Height slider scaling
          const finalHeight = calculatedHeight * heightScale;
          
          const x = startX + i * (barWidth + barSpacing);
          const y = centerY - (finalHeight / 2);
          
          ctx.beginPath();
          // @ts-ignore
          if (ctx.roundRect) ctx.roundRect(x, y, barWidth, finalHeight, cornerRadius);
          else ctx.rect(x, y, barWidth, finalHeight);
          ctx.fill();
          ctx.stroke(); 
        }
    }
  };

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default VisualizerCanvas;