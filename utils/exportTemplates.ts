import { VisualizerConfig, VisualizerMode } from '../types';

export const generateThreeJSCode = (config: VisualizerConfig): string => {
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
            background: #0F1118; 
            overflow: hidden; 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: white;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #verification-panel {
            background: rgba(0, 0, 0, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 12px 20px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            color: #4ade80;
            z-index: 1000;
            position: relative;
            max-height: 140px;
            overflow-y: auto;
        }
        #verification-panel strong { color: #fff; display: block; margin-bottom: 4px; font-size: 10px; text-transform: uppercase; }
        #canvas-container { 
            flex: 1; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            position: relative; 
            background: #0F1118;
        }
        #visualizer-mask {
            width: ${config.containerWidth}px;
            height: ${config.containerHeight}px;
            position: relative;
            overflow: hidden;
            background: #0F1118;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.03);
        }
        #overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(15, 17, 24, 0.95);
            backdrop-filter: blur(20px);
            z-index: 100;
        }
        #overlay.hidden { opacity: 0; pointer-events: none; transition: opacity 0.6s ease; }
        .btn {
            background: white; color: black; padding: 14px 32px; border-radius: 99px;
            font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;
            border: none; cursor: pointer;
        }
        canvas { display: block; }
    </style>
</head>
<body>
    <div id="verification-panel">
        <strong>Export Verification Data</strong>
        <pre>${configJson}</pre>
    </div>

    <div id="canvas-container">
        <div id="visualizer-mask">
            <!-- Three.js Canvas -->
        </div>
        <div id="overlay">
            <button id="startBtn" class="btn">Start Visualization</button>
        </div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/examples/jsm/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
    }
    </script>
    <script type="module">
        import * as THREE from 'three';
        import { Line2 } from 'three/examples/jsm/lines/Line2.js';
        import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
        import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
        import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
        import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
        import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

        const CONFIG = ${configJson};
        let scene, camera, renderer, composer, analyser, dataArray;
        let elements = []; // Stores Lines or Meshes
        let isInitialized = false;
        let paperState = [];
        let springState = [];
        let waveHistory = [];
        let smoothRms = 0;

        const MASK_W = CONFIG.containerWidth;
        const MASK_H = CONFIG.containerHeight;
        const ASPECT = MASK_W / MASK_H;
        const VIEW_W = 16; 
        const VIEW_H = VIEW_W / ASPECT;

        function init() {
            const container = document.getElementById('visualizer-mask');
            scene = new THREE.Scene();
            
            camera = new THREE.OrthographicCamera(-VIEW_W/2, VIEW_W/2, VIEW_H/2, -VIEW_H/2, 0.1, 1000);
            const yOffset = (CONFIG.verticalShift / 100) * VIEW_H;
            camera.position.set(0, yOffset, 10);
            camera.lookAt(0, yOffset, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(MASK_W, MASK_H);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(MASK_W, MASK_H), 0.8, 0.2, 0.1);
            bloomPass.threshold = 0.05;
            bloomPass.strength = 1.0; 
            bloomPass.radius = 0.15;

            composer = new EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);
            composer.addPass(new OutputPass());

            if (CONFIG.mode === 'BARS') {
                for (let i = 0; i < 10; i++) {
                    const geom = new THREE.BoxGeometry(0.5, 1, 0.1);
                    const mat = new THREE.MeshBasicMaterial({ color: CONFIG.color });
                    const bar = new THREE.Mesh(geom, mat);
                    scene.add(bar);
                    elements.push(bar);
                }
            } else {
                let count = 1;
                if (CONFIG.mode === 'PAPER_BAND') count = CONFIG.paper.waves;
                if (CONFIG.mode === 'SPRING_BAND') count = 4;
                if (CONFIG.mode === 'ENVELOPE') count = 2;

                for (let i = 0; i < count; i++) {
                    const color = new THREE.Color(CONFIG.palette[i % CONFIG.palette.length]);
                    const geometry = new LineGeometry();
                    const material = new LineMaterial({
                        color: color.getHex(),
                        linewidth: 4,
                        transparent: true,
                        resolution: new THREE.Vector2(MASK_W, MASK_H)
                    });
                    const line = new Line2(geometry, material);
                    line.userData.idx = i;
                    scene.add(line);
                    elements.push(line);
                }
            }
            animate();
        }

        async function startAudio() {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                audioCtx.createMediaStreamSource(stream).connect(analyser);
            } catch (err) {
                const osc = audioCtx.createOscillator(); osc.connect(analyser); osc.start();
            }
            if (audioCtx.state === 'suspended') await audioCtx.resume();
            isInitialized = true;
            document.getElementById('overlay').classList.add('hidden');
        }

        function animate() {
            requestAnimationFrame(animate);
            if (isInitialized) {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0; for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const rms = (sum / dataArray.length) / 255.0;
                smoothRms += (rms - smoothRms) * 0.15;
                updateGeometry(smoothRms, dataArray);
            }
            composer.render();
        }

        function updateGeometry(rms, data) {
            const time = Date.now() * 0.001;
            const sens = CONFIG.sensitivity;

            if (CONFIG.mode === 'BARS') {
                elements.forEach((bar, i) => {
                    const val = data[i * 5] / 255.0;
                    const h = 0.5 + (val * 5 * sens) + (rms * 2);
                    bar.scale.y = h;
                    bar.position.x = (i * 0.7) - 3.15;
                });
                return;
            }

            if (CONFIG.mode === 'PAPER_BAND') {
                const amount = CONFIG.paper.amount;
                if (paperState.length !== amount) paperState = new Array(amount).fill(0);
                for (let i = 0; i < amount; i++) {
                    const target = data[Math.floor(i * (data.length / amount))] / 255.0;
                    paperState[i] += (target - paperState[i]) * 0.15;
                }
            }

            if (CONFIG.mode === 'SPRING_BAND' && springState.length === 0) {
                springState = Array.from({length: 4}, () => ({pos: 0, vel: 0}));
            }
            if (CONFIG.mode === 'SPRING_BAND') {
                springState.forEach(s => {
                    const force = (rms * 5 * sens - s.pos) * 0.15;
                    s.vel = (s.vel + force) * 0.82;
                    s.pos += s.vel;
                });
            }

            if (CONFIG.mode === 'WAVE') {
                waveHistory.push(rms * CONFIG.wave.amplitude * 0.05);
                if (waveHistory.length > 128) waveHistory.shift();
            }

            elements.forEach((line) => {
                const idx = line.userData.idx;
                let pts = [];
                const count = 64;

                for (let i = 0; i <= count; i++) {
                    const t = i / count;
                    const x = (t * VIEW_W) - (VIEW_W / 2);
                    let y = 0;

                    if (CONFIG.mode === 'PAPER_BAND') {
                        const bandIdx = Math.floor((1 - t) * (CONFIG.paper.amount - 1));
                        const intensity = paperState[bandIdx] || 0;
                        const mag = (intensity * 5 * sens) + (CONFIG.paper.idle * 0.1);
                        y = - mag * Math.sin((idx * Math.PI/2) + (i * 0.3) + time);
                    } else if (CONFIG.mode === 'ENVELOPE') {
                        const env = Math.sin(t * Math.PI);
                        const side = idx === 0 ? 1 : -1;
                        y = env * Math.sin(x * 5 + time * 4) * (rms * sens * 1.5) * side;
                    } else if (CONFIG.mode === 'SINO') {
                        const env = Math.exp(-Math.pow((x/4), 2) * 2);
                        y = env * Math.sin(x * 4 + time * 5) * (rms * sens * 3);
                    } else if (CONFIG.mode === 'SPRING_BAND') {
                        const env = Math.sin(t * Math.PI);
                        const s = springState[idx];
                        y = env * Math.sin(x * 3 + (idx * Math.PI/2)) * s.pos;
                    } else if (CONFIG.mode === 'WAVE') {
                        const historyIdx = Math.floor(t * (waveHistory.length - 1));
                        y = waveHistory[historyIdx] || 0;
                    }

                    pts.push(x, y, 0);
                }
                line.geometry.setPositions(pts);
            });
        }

        document.getElementById('startBtn').addEventListener('click', startAudio);
        init();
    </script>
</body>
</html>`;
};

export const generateLottiePreset = (config: VisualizerConfig): string => {
    return JSON.stringify({ v: "5.5.7", layers: [] });
};