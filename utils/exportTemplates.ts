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
            background: #0F1118; 
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
            background: rgba(15, 17, 24, 0.9);
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
            renderer.setClearColor(0x0f1118, 1);
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
