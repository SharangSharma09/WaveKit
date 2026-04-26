import { VisualizerConfig, VisualizerMode } from '../types';

export const generateThreeJSCode = (config: VisualizerConfig): string => {
  // Serialize the entire config to be used inside the template
  const configJson = JSON.stringify(config, null, 2);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D Voice Visualizer - ${config.mode}</title>
    <style>
        body { 
            margin: 0; 
            background: #1C1C1C; 
            overflow: hidden; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: white;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #verification-panel {
            background: rgba(0, 0, 0, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 20px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #4ade80;
            z-index: 1000;
            position: relative;
            max-height: 200px;
            overflow-y: auto;
            pointer-events: auto;
        }
        #verification-panel strong {
            color: #fff;
            display: block;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            font-size: 10px;
        }
        #canvas-container {
            flex: 1;
            position: relative;
            overflow: hidden;
        }
        canvas { display: block; }
        #overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(28, 28, 28, 0.9);
            backdrop-filter: blur(20px);
            z-index: 100;
            transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #overlay.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .btn {
            background: white;
            color: black;
            padding: 16px 40px;
            border-radius: 99px;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border: none;
            cursor: pointer;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 0.2s ease, background 0.2s ease;
        }
        .btn:hover {
            transform: scale(1.05);
            background: #f0f0f0;
        }
        .info {
            margin-top: 24px;
            font-size: 12px;
            opacity: 0.4;
            letter-spacing: 0.05em;
            text-align: center;
            max-width: 300px;
            line-height: 1.6;
        }
        .status-bar {
            position: fixed;
            bottom: 24px;
            left: 24px;
            display: flex;
            gap: 16px;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: rgba(255,255,255,0.3);
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div id="verification-panel">
        <strong>Export Verification Data (Current UI State)</strong>
        <pre>${configJson}</pre>
    </div>

    <div id="canvas-container">
        <div id="overlay">
            <button id="startBtn" class="btn">Enter Visualizer</button>
            <div class="info">Click to activate audio analysis.<br/>Fallback simulated mode enabled for restricted environments.</div>
        </div>
        <div class="status-bar">
            <span>Mode: ${config.mode}</span>
            <span id="audio-status">Audio: Ready</span>
        </div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js"
        }
    }
    </script>
    <script type="module">
        import * as THREE from 'three';

        // The exact configuration from the UI
        const CONFIG = ${configJson};

        let scene, camera, renderer, visualMesh, analyser, dataArray;
        let isInitialized = false;
        let isSimulated = false;
        let smoothRms = 0;

        function init() {
            const container = document.getElementById('canvas-container');
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            
            // Adjust camera based on vertical shift
            const yOffset = (CONFIG.verticalShift / 100) * 5;
            camera.position.set(0, 1 - yOffset, 6);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setClearColor(0x1C1C1C, 1);
            container.appendChild(renderer.domElement);

            // Lighting
            const ambient = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambient);
            const point = new THREE.PointLight(CONFIG.color, 2, 20);
            point.position.set(0, 2, 2);
            scene.add(point);

            // Visualizer Geometry - Points count reflects points setting
            let pointsCount = 128;
            if (CONFIG.mode === 'ENVELOPE') pointsCount = CONFIG.envelope.points;
            if (CONFIG.mode === 'PAPER_BAND') pointsCount = CONFIG.paper.points;

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(pointsCount * 3);
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const material = new THREE.LineBasicMaterial({ 
                color: CONFIG.color,
                linewidth: 4,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });

            visualMesh = new THREE.Line(geometry, material);
            scene.add(visualMesh);

            // Floor Grid
            const grid = new THREE.GridHelper(30, 30, 0x222222, 0x111111);
            grid.position.y = -2.5 - yOffset;
            scene.add(grid);

            window.addEventListener('resize', onWindowResize);
            animate();
        }

        async function startAudio() {
            const statusEl = document.getElementById('audio-status');
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            dataArray = new Uint8Array(analyser.frequencyBinCount);

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(analyser);
                statusEl.textContent = 'Audio: Live Mic';
                isSimulated = false;
            } catch (err) {
                console.warn("Microphone access failed. Falling back to simulation.", err);
                const osc = audioCtx.createOscillator();
                const lfo = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                const lfoGain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, audioCtx.currentTime);
                lfo.frequency.setValueAtTime(1.5, audioCtx.currentTime);
                lfoGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);
                gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
                osc.connect(gain);
                gain.connect(analyser);
                osc.start();
                lfo.start();
                statusEl.textContent = 'Audio: Simulated';
                isSimulated = true;
            }

            if (audioCtx.state === 'suspended') await audioCtx.resume();
            isInitialized = true;
            document.getElementById('overlay').classList.add('hidden');
        }

        function onWindowResize() {
            const container = document.getElementById('canvas-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            if (isInitialized) {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const rms = (sum / dataArray.length) / 255.0;
                smoothRms += (rms - smoothRms) * 0.15;
                updateGeometry(smoothRms);
            }
            renderer.render(scene, camera);
        }

        function updateGeometry(rms) {
            const pos = visualMesh.geometry.attributes.position.array;
            const count = pos.length / 3;
            const time = Date.now() * 0.001;
            const sens = CONFIG.sensitivity;
            const yBase = (CONFIG.verticalShift / 100) * 5;

            for (let i = 0; i < count; i++) {
                const t = i / (count - 1);
                const x = (t * 14) - 7;
                let y = 0;

                if (CONFIG.mode === 'SINO') {
                    const freq = (Math.PI * 2) / (CONFIG.sino.wavelength / 50); 
                    const speed = CONFIG.sino.speed * 3;
                    const amp = (CONFIG.sino.amplitude / 40) * (rms * sens * 4 + 0.3);
                    y = Math.sin(x * freq + time * speed) * amp;
                } else if (CONFIG.mode === 'ENVELOPE') {
                    const envelope = Math.sin(t * Math.PI);
                    const speed = CONFIG.envelope.speed * 100;
                    const amp = (CONFIG.envelope.amplitude / 40) * (rms * sens * 5 + 0.6);
                    y = envelope * Math.sin(x * 5 + time * speed) * amp;
                } else if (CONFIG.mode === 'WAVE') {
                    const speed = 6;
                    const noise = Math.sin(x * 8 + time * speed) * (CONFIG.wave.noise / 100);
                    y = (rms * sens * (CONFIG.wave.amplitude / 50)) + noise;
                } else if (CONFIG.mode === 'PAPER_BAND') {
                   const freq = 1 + (CONFIG.paper.waves);
                   y = Math.sin(x * freq + time * 2) * (rms * sens * 2 + (CONFIG.paper.idle / 10));
                } else {
                    const specIdx = Math.floor(t * dataArray.length * 0.5);
                    y = (dataArray[specIdx] / 255) * sens * 2.5;
                }

                pos[i * 3] = x;
                pos[i * 3 + 1] = y + yBase;
                pos[i * 3 + 2] = Math.sin(time + x * 0.5) * 0.3;
            }
            
            visualMesh.geometry.attributes.position.needsUpdate = true;
            camera.lookAt(0, yBase + (smoothRms * 2), 0);
        }

        document.getElementById('startBtn').addEventListener('click', startAudio);
        init();
    </script>
</body>
</html>`;
};

export const generateLottiePreset = (config: VisualizerConfig): string => {
  const { color } = config;
  const lottie = {
    "v": "5.5.7",
    "fr": 60,
    "ip": 0,
    "op": 60,
    "w": 500,
    "h": 500,
    "nm": "Visualizer Export",
    "ddd": 0,
    "assets": [],
    "layers": [
      {
        "ddd": 0,
        "ind": 1,
        "ty": 4,
        "nm": "Wave",
        "sr": 1,
        "ks": {
          "o": { "a": 0, "k": 100 },
          "r": { "a": 0, "k": 0 },
          "p": { "a": 0, "k": [250, 250, 0] },
          "a": { "a": 0, "k": [0, 0, 0] },
          "s": { "a": 0, "k": [100, 100, 100] }
        },
        "ao": 0,
        "shapes": [
          {
            "ty": "gr",
            "it": [
              {
                "ty": "sh",
                "nm": "Path 1",
                "ks": {
                  "a": 1,
                  "k": [
                    {
                      "i": { "x": 0.833, "y": 0.833 },
                      "o": { "x": 0.167, "y": 0.167 },
                      "t": 0,
                      "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[-100, 0], [100, 0]], "c": false }]
                    },
                    {
                      "t": 30,
                      "s": [{ "i": [[0, -50], [0, 50]], "o": [[0, 50], [0, -50]], "v": [[-100, 0], [100, 0]], "c": false }]
                    },
                    {
                      "t": 60,
                      "s": [{ "i": [[0, 0], [0, 0]], "o": [[0, 0], [0, 0]], "v": [[-100, 0], [100, 0]], "c": false }]
                    }
                  ]
                }
              },
              {
                "ty": "st",
                "c": { "k": hexToRgbNormalized(color) },
                "o": { "k": 100 },
                "w": { "k": 10 },
                "lc": 2,
                "lj": 2,
                "nm": "Stroke 1"
              }
            ]
          }
        ]
      }
    ]
  };
  return JSON.stringify(lottie, null, 2);
};

const hexToRgbNormalized = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1
  ] : [1, 1, 1, 1];
};

// ─── React Native + Skia Export ───────────────────────────────────────────────
//
// Web canvas coordinate space:
//   width  = containerWidth  (default 784px, user-configurable)
//   height = ~576px          (VIRTUAL_HEIGHT 640 × CSS scale-90)
//
// Mobile target:
//   width  = Dimensions.get('window').width  (≈390pt iPhone / dp Android)
//   height = targetHeight (user-chosen: proportional | compact | custom)
//
// Two scale factors:
//   scaleX = targetWidth  / webWidth   (horizontal values)
//   scaleY = targetHeight / webHeight  (vertical displacement values)
//
// Works identically on iOS and Android — Skia handles device pixel ratio.

const WEB_CANVAS_HEIGHT = 576; // 640 virtual * 0.9 CSS scale
const DEFAULT_MOBILE_WIDTH = 390;

const s = (value: number, scale: number): number =>
  parseFloat((value * scale).toFixed(2));

export const generateReactNativeCode = (
  config: VisualizerConfig,
  targetHeight?: number,
  targetWidth?: number,   // undefined = full screen (Dimensions.get)
): string => {
  const webWidth  = config.containerWidth || 784;
  const webHeight = WEB_CANVAS_HEIGHT;

  // Reference width used for scaleX: either the fixed target or the default 390pt
  const refWidth  = targetWidth ?? DEFAULT_MOBILE_WIDTH;
  const scaleX    = refWidth / webWidth;
  const CANVAS_HEIGHT = targetHeight ?? Math.round(refWidth * (webHeight / webWidth));
  const scaleY = CANVAS_HEIGHT / webHeight;

  // ── Scale every pixel-dependent value ─────────────────────────────────────
  // X-axis: widths, spacings, strokeWidths, wavelengths
  // Y-axis: amplitudes, vertical displacements, noise
  const scaled = {
    // Wave
    waveAmplitude:         s(config.wave.amplitude,        scaleY),
    waveNoise:             s(config.wave.noise,            scaleY),
    waveLineWidthBase:     s(4,                            scaleX),
    waveLineWidthRms:      s(4,                            scaleX),  // adds rms * this
    waveShadowBlur:        s(10,                           scaleX),
    // Envelope
    envelopeAmplitude:     s(config.envelope.amplitude,    scaleY),
    envelopeRmsRange:      s(120,                          scaleY),  // hardcoded rms*120
    envelopeStrokeWidth:   s(config.envelope.strokeWidth,  scaleX),
    envelopeShadowBlur:    s(15,                           scaleX),
    // Sino
    sinoAmplitude:         s(config.sino.amplitude,        scaleY),
    sinoRmsRange:          s(150,                          scaleY),  // hardcoded rms*150
    sinoWavelength:        s(config.sino.wavelength,       scaleX),
    sinoLineWidth:         s(6,                            scaleX),
    // Bars
    barWidth:              s(config.bars.width,            scaleX),
    barHeight:             s(config.bars.height,           scaleY),
    barSpacing:            s(config.bars.spacing,          scaleX),
    barAmplitude:          s(config.bars.amplitude,        scaleY),
    barBaseHeightQuiet:    s(8,                            scaleY),
    barBaseHeightLoud:     s(12,                           scaleY),
    // Paper Band
    paperStrokeWidth:      s(config.paper.strokeWidth,     scaleX),
    paperIdleAmplitude:    s(config.paper.idle,            scaleY),
    paperScale:            s(30,                           scaleY),  // paperScale is always 30 in editor
    paperShadowBlur:       s(12,                           scaleX),
    // Spring Band
    springAmplitude:       s(60,                           scaleY),  // editor default, not in config
    springLineWidth:       s(4,                            scaleX),
    // Idle circle
    idleCircleRadius:      s(50,                           (scaleX + scaleY) / 2),
    idleCircleStroke:      s(2,                            scaleX),
  };

  // Config block embedded in the generated file
  const configComment = JSON.stringify({
    mode:               config.mode,
    sensitivity:        config.sensitivity,
    color:              config.color,
    verticalShift:      config.verticalShift,
    // scaled values
    ...scaled,
    // unscaled (ratios / counts, not pixel values)
    envelopeSpeed:      config.envelope.speed,
    envelopePoints:     config.envelope.points,
    envelopeFillOpacity:config.envelope.opacity,
    envelopeMoving:     config.envelope.moving,
    waveSpeed:          config.wave.speed,
    waveMoving:         config.wave.moving,
    sinoSpeed:          config.sino.speed,
    sinoMoving:         config.sino.moving,
    numBars:            config.bars.waves,
    barRoundness:       config.bars.roundness,
    barMoving:          config.bars.moving,
    barSpeed:           config.bars.speed,
    paperAmount:        config.paper.amount,
    paperWaves:         config.paper.waves,
    paperPoints:        config.paper.points,
    paperMoving:        config.paper.moving,
    paperSpeed:         config.paper.speed,
    paperWaveColors:    config.paper.colors,
  }, null, 2);

  return `// ─────────────────────────────────────────────────────────────────────────────
// WaveKitVisualizer.tsx  —  Generated by WaveKit
// Mode: ${config.mode}
//
// DEPENDENCIES — install before using:
//   npx expo install @shopify/react-native-skia
//
// USAGE:
//   import { WaveKitVisualizer } from './WaveKitVisualizer';
//   <WaveKitVisualizer rms={yourMicRmsValue} />
//
//   \`rms\` should be a number from 0.0 → 1.0 representing microphone volume.
//   Hook it up to expo-av or your existing audio pipeline.
//
// CANVAS:  ${targetWidth ? `${targetWidth}pt fixed` : 'full screen width'} × ${CANVAS_HEIGHT}pt tall
//   scaleX = ${scaleX.toFixed(4)}  (web width  ${webWidth}px  → ${refWidth}pt)
//   scaleY = ${scaleY.toFixed(4)}  (web height ${webHeight}px → ${CANVAS_HEIGHT}pt)
//
// Compatible with both iOS and Android — Skia handles device pixel density.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { Dimensions, View, StyleSheet } from 'react-native';
import {
  Canvas,
  Path,
  Circle,
  Skia,
  useDerivedValue,
  useSharedValue,
  Shadow,
} from '@shopify/react-native-skia';

// ── Scaled config (all pixel values pre-scaled for ${refWidth}pt width × ${CANVAS_HEIGHT}pt height) ──
const CONFIG = ${configComment};

${targetWidth
  ? `const CANVAS_WIDTH  = ${targetWidth}; // fixed — change to Dimensions.get('window').width to stretch full screen`
  : `const CANVAS_WIDTH  = Dimensions.get('window').width; // stretches to fit any device`
}
const CANVAS_HEIGHT = ${CANVAS_HEIGHT};
const CENTER_Y      = CANVAS_HEIGHT / 2 + CANVAS_HEIGHT * (CONFIG.verticalShift / 100);

// ── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 255, g: 255, b: 255 };
}

function toSkiaColor(hex: string, alpha = 1): string {
  const { r, g, b } = hexToRgb(hex);
  return \`rgba(\${r},\${g},\${b},\${alpha})\`;
}

// ── Path builders (one per visualizer mode) ──────────────────────────────────

function buildWavePath(rms: number): string {
  const pts  = 120;
  const step = CANVAS_WIDTH / (pts - 1);
  let d = '';
  for (let i = 0; i < pts; i++) {
    const x      = i * step;
    const noise  = (Math.random() - 0.5);
    const mag    = CONFIG.waveNoise * 0.3 + rms * Math.abs(CONFIG.waveAmplitude);
    const y      = CENTER_Y + noise * mag;
    d += i === 0 ? \`M\${x},\${y}\` : \` L\${x},\${y}\`;
  }
  return d;
}

function buildEnvelopePaths(rms: number, phase: number): { upper: string; lower: string } {
  const pts    = CONFIG.envelopePoints;
  const step   = CANVAS_WIDTH / (pts - 1);
  const k      = (Math.PI * 2) / (CANVAS_WIDTH * 0.8);
  const amp    = CONFIG.envelopeAmplitude + rms * CONFIG.envelopeRmsRange * CONFIG.sensitivity;
  let upper = '', lower = '';
  for (let i = 0; i < pts; i++) {
    const x   = i * step;
    const env = Math.sin((x / CANVAS_WIDTH) * Math.PI);
    const d   = env * amp * Math.sin(x * k + phase);
    upper += i === 0 ? \`M\${x},\${CENTER_Y - d}\` : \` L\${x},\${CENTER_Y - d}\`;
    lower += i === 0 ? \`M\${x},\${CENTER_Y + d}\` : \` L\${x},\${CENTER_Y + d}\`;
  }
  return { upper, lower };
}

function buildSinoPath(rms: number, phase: number): string {
  const freq = (Math.PI * 2) / CONFIG.sinoWavelength;
  const amp  = CONFIG.sinoAmplitude + rms * CONFIG.sinoRmsRange * CONFIG.sensitivity;
  const cx   = CANVAS_WIDTH / 2;
  let d = '';
  for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
    const dist = Math.abs(x - cx) / cx;
    const env  = Math.exp(-3.8 * dist * dist);
    const y    = CENTER_Y + Math.sin(x * freq + phase) * amp * env;
    d += x === 0 ? \`M\${x},\${y}\` : \` L\${x},\${y}\`;
  }
  return d;
}

function buildBarsPath(rms: number): string {
  const count  = CONFIG.numBars;
  const bw     = CONFIG.barWidth;
  const bs     = CONFIG.barSpacing;
  const totalW = count * bw + (count - 1) * bs;
  const startX = (CANVAS_WIDTH - totalW) / 2;
  const mid    = (count - 1) / 2;
  const isQuiet = rms < 0.005;
  const baseH   = isQuiet ? CONFIG.barBaseHeightQuiet : CONFIG.barBaseHeightLoud;
  const roundPx = (CONFIG.barRoundness / 100) * (bw / 2);
  let d = '';
  for (let i = 0; i < count; i++) {
    const dist     = Math.abs(i - mid);
    const dampened = isQuiet ? 0 : Math.max(0, Math.min(1, (rms - 0.005) * 20));
    const val      = dampened * (dist / (count / 2));
    const h        = baseH + (val + (isQuiet ? 0 : rms)) * CONFIG.barAmplitude * 2;
    const x        = startX + i * (bw + bs);
    const y        = CENTER_Y - h / 2;
    const r        = Math.min(roundPx, h / 2, bw / 2);
    // Rounded rect via arc segments
    d += \`M\${x + r},\${y}\`;
    d += \` L\${x + bw - r},\${y}\`;
    d += \` Q\${x + bw},\${y} \${x + bw},\${y + r}\`;
    d += \` L\${x + bw},\${y + h - r}\`;
    d += \` Q\${x + bw},\${y + h} \${x + bw - r},\${y + h}\`;
    d += \` L\${x + r},\${y + h}\`;
    d += \` Q\${x},\${y + h} \${x},\${y + h - r}\`;
    d += \` L\${x},\${y + r}\`;
    d += \` Q\${x},\${y} \${x + r},\${y} Z \`;
  }
  return d;
}

function buildPaperBandPath(rms: number, phase: number, waveIndex: number): string {
  const amount      = CONFIG.paperAmount;
  const pointsCount = CONFIG.paperPoints;
  const step        = CANVAS_WIDTH / (pointsCount + 1);
  const wavePhase   = waveIndex * (Math.PI / 2);
  const intensity   = rms * CONFIG.sensitivity;
  const voiceMod    = intensity * CONFIG.paperScale * 2.5;
  const magnitude   = voiceMod + CONFIG.paperIdleAmplitude;
  const points: { x: number; y: number }[] = [{ x: 0, y: CENTER_Y }];
  for (let i = 1; i <= pointsCount; i++) {
    const x            = i * step;
    const breathing    = Math.sin(Date.now() * 0.001 + i * 0.1) * 0.2;
    const indivPhase   = wavePhase + i * 0.3 + breathing + phase;
    const yOffset      = -magnitude * Math.sin(indivPhase);
    points.push({ x, y: CENTER_Y + yOffset });
  }
  points.push({ x: CANVAS_WIDTH, y: CENTER_Y });

  let d = \`M\${points[0].x},\${points[0].y}\`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const xc = (p0.x + p1.x) / 2;
    const yc = (p0.y + p1.y) / 2;
    d += \` Q\${p0.x},\${p0.y} \${xc},\${yc}\`;
  }
  const last = points[points.length - 1];
  d += \` L\${last.x},\${last.y}\`;
  return d;
}

function buildSpringBandPath(rms: number, strandIndex: number, strandPos: number): string {
  const frequency  = (Math.PI * 3) / CANVAS_WIDTH;
  const phaseOffset = (2 * Math.PI * strandIndex) / 3; // assume 3 strands
  let d = '';
  for (let x = 0; x <= CANVAS_WIDTH; x += 4) {
    const env = Math.sin((x / CANVAS_WIDTH) * Math.PI);
    const y   = CENTER_Y + Math.sin(x * frequency + phaseOffset) * strandPos * env;
    d += x === 0 ? \`M\${x},\${y}\` : \` L\${x},\${y}\`;
  }
  return d;
}

// Spring physics state (module-level so it persists across renders)
const springState = [
  { pos: 0, vel: 0 },
  { pos: 0, vel: 0 },
  { pos: 0, vel: 0 },
];
const SPRING_COLORS = ['#40B9F8', '#8E8EFF', '#D48EFF'];

// ── Component ─────────────────────────────────────────────────────────────────
interface WaveKitVisualizerProps {
  /** Microphone RMS value — 0.0 (silence) to 1.0 (loud). */
  rms: number;
}

export function WaveKitVisualizer({ rms }: WaveKitVisualizerProps) {
  const phase   = useSharedValue(0);
  const tick    = useRef(0);
  const frameId = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      tick.current += 1;
      phase.value += (CONFIG.envelopeSpeed ?? 1) * 0.04;
      frameId.current = requestAnimationFrame(loop);
    };
    frameId.current = requestAnimationFrame(loop);
    return () => { if (frameId.current) cancelAnimationFrame(frameId.current); };
  }, []);

  const mainColor  = CONFIG.color;
  const { r, g, b } = hexToRgb(mainColor);
  const glowColor    = \`rgba(\${r},\${g},\${b},0.5)\`;

  // ── Wave ──────────────────────────────────────────────────────────────────
  const wavePath = useDerivedValue(() => {
    const svgStr = buildWavePath(rms);
    return Skia.Path.MakeFromSVGString(svgStr) ?? Skia.Path.Make();
  }, [phase]);

  const waveStrokeWidth = CONFIG.waveLineWidthBase + rms * CONFIG.waveLineWidthRms;

  // ── Envelope ──────────────────────────────────────────────────────────────
  const envelopeUpperPath = useDerivedValue(() => {
    const { upper } = buildEnvelopePaths(rms, phase.value);
    return Skia.Path.MakeFromSVGString(upper) ?? Skia.Path.Make();
  }, [phase]);

  const envelopeLowerPath = useDerivedValue(() => {
    const { lower } = buildEnvelopePaths(rms, phase.value);
    return Skia.Path.MakeFromSVGString(lower) ?? Skia.Path.Make();
  }, [phase]);

  const fillOpacity = (CONFIG.envelopeFillOpacity ?? 20) / 100;

  // ── Sino ──────────────────────────────────────────────────────────────────
  const sinoPath = useDerivedValue(() => {
    const svgStr = buildSinoPath(rms, phase.value);
    return Skia.Path.MakeFromSVGString(svgStr) ?? Skia.Path.Make();
  }, [phase]);

  // ── Bars ──────────────────────────────────────────────────────────────────
  const barsPath = useDerivedValue(() => {
    const svgStr = buildBarsPath(rms);
    return Skia.Path.MakeFromSVGString(svgStr) ?? Skia.Path.Make();
  }, [phase]);

  // ── Paper Band ────────────────────────────────────────────────────────────
  const paperPaths = Array.from({ length: CONFIG.paperWaves ?? 3 }, (_, wi) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDerivedValue(() => {
      const svgStr = buildPaperBandPath(rms, phase.value, wi);
      return Skia.Path.MakeFromSVGString(svgStr) ?? Skia.Path.Make();
    }, [phase])
  );

  // ── Spring Band ───────────────────────────────────────────────────────────
  const stiffness = 0.15;
  const damping   = 0.82;
  const targetDisp = CONFIG.springAmplitude * 0.4 + rms * CONFIG.springAmplitude * 1.6;
  springState.forEach((strand, i) => {
    const indivTarget = targetDisp * (1.0 + i * 0.05);
    const force = (indivTarget - strand.pos) * stiffness;
    strand.vel  = (strand.vel + force) * damping;
    strand.pos += strand.vel;
  });

  const springPaths = springState.map((strand, wi) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDerivedValue(() => {
      const svgStr = buildSpringBandPath(rms, wi, strand.pos);
      return Skia.Path.MakeFromSVGString(svgStr) ?? Skia.Path.Make();
    }, [phase])
  );

  const mode = CONFIG.mode;

  return (
    <View style={styles.container}>
      <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>

        {/* ── WAVE ────────────────────────────────────────────── */}
        {mode === 'WAVE' && (
          <Path
            path={wavePath}
            color={mainColor}
            style="stroke"
            strokeWidth={waveStrokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <Shadow dx={0} dy={0} blur={CONFIG.waveShadowBlur} color={glowColor} />
          </Path>
        )}

        {/* ── ENVELOPE ────────────────────────────────────────── */}
        {mode === 'ENVELOPE' && (
          <>
            {/* Fill shape (upper + lower joined) */}
            <Path
              path={envelopeUpperPath}
              color={toSkiaColor(mainColor, fillOpacity)}
              style="fill"
            />
            {/* Upper stroke */}
            <Path
              path={envelopeUpperPath}
              color={mainColor}
              style="stroke"
              strokeWidth={CONFIG.envelopeStrokeWidth}
              strokeCap="round"
              strokeJoin="round"
            >
              <Shadow dx={0} dy={0} blur={CONFIG.envelopeShadowBlur} color={glowColor} />
            </Path>
            {/* Lower stroke */}
            <Path
              path={envelopeLowerPath}
              color={mainColor}
              style="stroke"
              strokeWidth={CONFIG.envelopeStrokeWidth}
              strokeCap="round"
              strokeJoin="round"
            >
              <Shadow dx={0} dy={0} blur={CONFIG.envelopeShadowBlur} color={glowColor} />
            </Path>
          </>
        )}

        {/* ── SINO ────────────────────────────────────────────── */}
        {mode === 'SINO' && (
          <Path
            path={sinoPath}
            color={mainColor}
            style="stroke"
            strokeWidth={CONFIG.sinoLineWidth}
            strokeCap="round"
            strokeJoin="round"
          />
        )}

        {/* ── BARS ────────────────────────────────────────────── */}
        {mode === 'BARS' && (
          <Path
            path={barsPath}
            color={mainColor}
            style="fill"
          />
        )}

        {/* ── PAPER BAND ──────────────────────────────────────── */}
        {mode === 'PAPER_BAND' &&
          paperPaths.map((p, wi) => {
            const waveColor = (CONFIG.paperWaveColors ?? [])[wi] ?? mainColor;
            const { r: wr, g: wg, b: wb } = hexToRgb(waveColor);
            return (
              <Path
                key={wi}
                path={p}
                color={waveColor}
                style="stroke"
                strokeWidth={CONFIG.paperStrokeWidth}
                strokeCap="round"
                strokeJoin="round"
              >
                <Shadow dx={0} dy={0} blur={CONFIG.paperShadowBlur} color={\`rgba(\${wr},\${wg},\${wb},0.6)\`} />
              </Path>
            );
          })
        }

        {/* ── SPRING BAND ─────────────────────────────────────── */}
        {mode === 'SPRING_BAND' &&
          springPaths.map((p, wi) => (
            <Path
              key={wi}
              path={p}
              color={SPRING_COLORS[wi % SPRING_COLORS.length]}
              style="stroke"
              strokeWidth={CONFIG.springLineWidth}
              strokeCap="round"
              strokeJoin="round"
            />
          ))
        }

        {/* ── IDLE circle (no audio) — remove if always listening ─ */}
        {!rms && (
          <Circle
            cx={CANVAS_WIDTH / 2}
            cy={CENTER_Y}
            r={CONFIG.idleCircleRadius}
            color={toSkiaColor(mainColor, 0.5)}
            style="stroke"
            strokeWidth={CONFIG.idleCircleStroke}
          />
        )}

      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: ${CANVAS_HEIGHT},
    overflow: 'hidden',
  },
});
`;
};