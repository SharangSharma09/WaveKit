import React, { useRef, useEffect } from 'react';

interface OrbCanvasProps {
  isListening: boolean;
  getMetrics: () => { rms: number; frequencyData: Uint8Array };
  sensitivity: number;
  orbNoise: number;
  orbBlur: number;
  orbSpeed: number;         // base field evolution rate (serene ≈ 0.045)
  orbNoiseScale: number;    // surface fbm spatial frequency
  orbWarpStrength: number;  // domain warp displacement strength
  orbVerticalBias: number;  // blue-down / white-up separation
  orbSaturation?: number;
  orbContrast?: number;
  orbForwardOnly?: boolean;
  size?: number;            // canvas size in px, default 500
}

// ---------------------------------------------------------------------------
// GLSL source strings
// ---------------------------------------------------------------------------

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform float u_time;
uniform float u_rms;
uniform float u_sensitivity;
uniform float u_noise;          // 0..1  idle speed multiplier (Noise Level slider)
uniform float u_blur;           // 0..1  boundary softness (Haze slider)
uniform float u_speed;          // base field evolution rate
uniform float u_noise_scale;    // surface fbm spatial frequency
uniform float u_warp_strength;  // domain warp displacement strength
uniform float u_vertical_bias;  // blue-down / white-up separation
uniform float u_saturation;     // color saturation multiplier
uniform float u_contrast;       // color contrast multiplier
uniform float u_audio_acc;
uniform bool  u_forward_only;

out vec4 fragColor;

// ---- Colors (hardcoded for icy/fluid feel) --------------------------------
const vec3 COLOR_TOP   = vec3(0.8706, 0.9608, 0.9961); // #DEF5FE (Light Blue-White)
const vec3 COLOR_MID_T = vec3(0.9843, 0.9843, 0.9843); // #FBFBFB (White)
const vec3 COLOR_MID_B = vec3(0.3412, 0.8000, 1.0000); // #57CCFF (Light Blue)
const vec3 COLOR_BOT   = vec3(0.3686, 0.5608, 1.0000); // #5E8FFF (Periwinkle Blue)

const float WARP_SCALE  = 2.1;   // warp field spatial frequency
const float GRAD_LOW    = 0.36;  // Used as the base boundary mapping
const float GRAD_HIGH   = 0.64;  // Used as the base boundary mapping

// ---- Value noise ---------------------------------------------------------
float hash(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float vnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  // Quintic interpolant for C2 continuity
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)), f.x),
        mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
        mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

// ---- Fractal Brownian Motion, 5 octaves ---------------------------------
float fbm(vec3 p) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    val  += amp * vnoise(p * freq);
    freq *= 2.01;   // slightly off-integer avoids grid alignment
    amp  *= 0.50;
  }
  return val;
}

// ---- Domain-warped fbm --------------------------------------------------
// Sample a warp field, then use it to distort the surface fbm.
// This makes the boundary arc and fold instead of sliding straight.
float warpedFbm(vec3 p, float warpStrength, float noiseScale, float t) {
  // Apply a continuous vertical drift so the fluid constantly falls/folds even when silent
  p.y -= t * 0.4;

  // Warp field: two offset fbm samples give a 2D displacement vector
  vec2 warp = vec2(
    fbm(p * WARP_SCALE + vec3(0.00, 0.00, t)),
    fbm(p * WARP_SCALE + vec3(5.23, 1.73, t + 1.7))
  );
  // Centre the warp around 0 (raw fbm is 0..1, we want -0.5..0.5)
  warp -= 0.5;
  // Apply displacement to the surface sample point
  vec3 warped = p + vec3(warp * warpStrength, 0.0);
  return fbm(warped * noiseScale + vec3(0.0, 0.0, t * 0.31));
}

void main() {
  // ---- Centred, aspect-correct UV -----------------------------------------
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float r = length(uv);

  // ---- Circle radius ------------------------------------------------------
  // Reduced to 0.44 so the feathered edge fits inside the 0.5 canvas bounds
  float orbRadius = 0.44;

  // ---- Crisp Circular Mask ------------------------------------------------
  // We use a fixed radius (slightly inside orbRadius) with a tiny 0.005 feather 
  // for smooth 1-pixel anti-aliasing. This keeps the physical boundary of the 
  // orb perfectly sharp, even when the haze inside is cranked up to maximum.
  float maskRadius = orbRadius * 0.98;
  float alpha = 1.0 - smoothstep(maskRadius - 0.005, maskRadius + 0.005, r);
  if (alpha <= 0.0) discard;

  // ---- Coordinate space for the surface (uv scaled to match previous feel) -
  vec3 pos = vec3(uv * 3.0, 0.0);

  // ---- Audio energy --------------------------------------------------------
  float audioEnergy = clamp(u_rms * u_sensitivity, 0.0, 1.0);

  // ---- Time: base speed from uniform, gently nudged by noise/audio --------
  float speed = u_speed + u_noise * 0.12 + audioEnergy * 0.08;
  float t     = u_time * speed;

  // ---- Warp strength from uniform, nudged by noise/audio ------------------
  float warpStrength = u_warp_strength + u_noise * 0.6 + audioEnergy * 0.4;

  // ---- Domain-warped surface value ----------------------------------------
  // If forward only, we inject accumulated audio energy into time so the flow permanently 
  // advances forward faster when speaking, rather than snapping back.
  float timeOffset = t;
  if (u_forward_only) {
    timeOffset += u_audio_acc * 2.5;
  }
  float f = warpedFbm(pos, warpStrength, u_noise_scale, timeOffset);

  // ---- Gentle vertical bias — blue sinks, white rises ---------------------
  // uv.y > 0 is the top half. Unclamped — let plumes arc against the bias.
  float bias = uv.y / orbRadius * u_vertical_bias;
  f = f + bias;

  // ---- Audio pulse: slight brightening on louder input --------------------
  // In forward-only mode, we skip this to prevent the "snap back" effect.
  if (!u_forward_only) {
    f = f + audioEnergy * 0.08;
  }

  // ---- Wide, feathered gradient boundary ----------------------------------
  // We use u_blur to widen the smoothsteps, causing softer transitions.
  float spread = u_blur * 0.15;
  
  // Transition 1: Bottom -> Lower Middle
  float blend1 = smoothstep(0.35 - spread, 0.40 + spread, f);
  
  // Transition 2: Lower Middle -> Upper Middle
  float blend2 = smoothstep(0.45 - spread, 0.50 + spread, f);
  
  // Transition 3: Upper Middle -> Top
  float blend3 = smoothstep(0.55 - spread, 0.60 + spread, f);

  // ---- Color mapping ------------------------------------------------------
  vec3 col = mix(COLOR_BOT, COLOR_MID_B, blend1);
  col = mix(col, COLOR_MID_T, blend2);
  col = mix(col, COLOR_TOP, blend3);

  // ---- Haze overlay: as u_blur rises, fog toward the upper middle color -
  col = mix(col, COLOR_MID_T, u_blur * 0.22);
  
  // ---- Saturation Adjustment ----------------------------------------------
  // Calculate luminance (sRGB)
  float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 greyScaleColor = vec3(luminance);
  col = mix(greyScaleColor, col, u_saturation);

  // ---- Contrast Adjustment ------------------------------------------------
  // Standard contrast formula: (color - 0.5) * contrast + 0.5
  col = (col - 0.5) * u_contrast + 0.5;

  col = clamp(col, 0.0, 1.0);

  // ---- Final output -------------------------------------------------------
  fragColor = vec4(col * alpha, alpha);
}
`;



// ---------------------------------------------------------------------------
// WebGL helpers
// ---------------------------------------------------------------------------

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error:\n${info}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link error:\n${info}`);
  }
  return prog;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const OrbCanvas: React.FC<OrbCanvasProps> = ({
  isListening,
  getMetrics,
  sensitivity,
  orbNoise,
  orbBlur,
  orbSpeed,
  orbNoiseScale,
  orbWarpStrength,
  orbVerticalBias,
  orbSaturation = 1.0,
  orbContrast = 1.0,
  orbForwardOnly = false,
  size = 500,
}) => {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const glRef            = useRef<WebGL2RenderingContext | null>(null);
  const progRef          = useRef<WebGLProgram | null>(null);
  const rafRef           = useRef<number>(0);
  const smoothRms        = useRef<number>(0);
  const startTime        = useRef<number>(performance.now());
  const noiseRef         = useRef<number>(orbNoise);
  const blurRef          = useRef<number>(orbBlur);
  const speedRef         = useRef<number>(orbSpeed);
  const noiseScaleRef    = useRef<number>(orbNoiseScale);
  const warpStrengthRef  = useRef<number>(orbWarpStrength);
  const verticalBiasRef  = useRef<number>(orbVerticalBias);
  const saturationRef    = useRef<number>(orbSaturation);
  const contrastRef      = useRef<number>(orbContrast);

  useEffect(() => { noiseRef.current        = orbNoise;        }, [orbNoise]);
  useEffect(() => { blurRef.current         = orbBlur;         }, [orbBlur]);
  useEffect(() => { speedRef.current        = orbSpeed;        }, [orbSpeed]);
  useEffect(() => { noiseScaleRef.current   = orbNoiseScale;   }, [orbNoiseScale]);
  useEffect(() => { warpStrengthRef.current = orbWarpStrength; }, [orbWarpStrength]);
  useEffect(() => { verticalBiasRef.current = orbVerticalBias; }, [orbVerticalBias]);
  useEffect(() => { saturationRef.current   = orbSaturation;   }, [orbSaturation]);
  useEffect(() => { contrastRef.current     = orbContrast;     }, [orbContrast]);

  // Uniform locations (cached after program link)
  const uResolution    = useRef<WebGLUniformLocation | null>(null);
  const uTime          = useRef<WebGLUniformLocation | null>(null);
  const uRms           = useRef<WebGLUniformLocation | null>(null);
  const uSensitivity   = useRef<WebGLUniformLocation | null>(null);
  const uNoise         = useRef<WebGLUniformLocation | null>(null);
  const uBlur          = useRef<WebGLUniformLocation | null>(null);
  const uSpeed         = useRef<WebGLUniformLocation | null>(null);
  const uNoiseScale    = useRef<WebGLUniformLocation | null>(null);
  const uWarpStrength  = useRef<WebGLUniformLocation | null>(null);
  const uVerticalBias  = useRef<WebGLUniformLocation | null>(null);
  const uSaturation    = useRef<WebGLUniformLocation | null>(null);
  const uContrast      = useRef<WebGLUniformLocation | null>(null);
  const uAudioAcc      = useRef<WebGLUniformLocation | null>(null);
  const uForwardOnly   = useRef<WebGLUniformLocation | null>(null);

  const audioAccRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Init WebGL2 --------------------------------------------------------
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true });
    if (!gl) {
      console.error('OrbCanvas: WebGL2 not supported in this browser.');
      return;
    }
    glRef.current = gl;

    // Compile shaders & link program
    let program: WebGLProgram;
    try {
      const vs = createShader(gl, gl.VERTEX_SHADER,   VERTEX_SHADER);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      program  = createProgram(gl, vs, fs);
    } catch (e) {
      console.error(e);
      return;
    }
    progRef.current = program;

    // Cache uniform locations
    uResolution.current   = gl.getUniformLocation(program, 'u_resolution');
    uTime.current         = gl.getUniformLocation(program, 'u_time');
    uRms.current          = gl.getUniformLocation(program, 'u_rms');
    uSensitivity.current  = gl.getUniformLocation(program, 'u_sensitivity');
    uNoise.current        = gl.getUniformLocation(program, 'u_noise');
    uBlur.current         = gl.getUniformLocation(program, 'u_blur');
    uSpeed.current        = gl.getUniformLocation(program, 'u_speed');
    uNoiseScale.current   = gl.getUniformLocation(program, 'u_noise_scale');
    uWarpStrength.current = gl.getUniformLocation(program, 'u_warp_strength');
    uVerticalBias.current = gl.getUniformLocation(program, 'u_vertical_bias');
    uSaturation.current   = gl.getUniformLocation(program, 'u_saturation');
    uContrast.current     = gl.getUniformLocation(program, 'u_contrast');
    uAudioAcc.current     = gl.getUniformLocation(program, 'u_audio_acc');
    uForwardOnly.current  = gl.getUniformLocation(program, 'u_forward_only');

    // Full-screen quad (two triangles covering clip space)
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const quadVerts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Blending for the transparent glow halo
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    startTime.current = performance.now();

    // --- Render loop --------------------------------------------------------
    const render = () => {
      if (!glRef.current || !progRef.current) return;

      const { rms } = isListening ? getMetrics() : { rms: 0 };

      // Smooth RMS with exponential moving average (same as existing canvas)
      const target = rms * sensitivity;
      smoothRms.current += (target - smoothRms.current) * 0.10;
      
      // Accumulate audio energy for the forward-only drift
      audioAccRef.current += smoothRms.current * 0.05;

      const t = (performance.now() - startTime.current) / 1000.0;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(progRef.current);
      gl.uniform2f(uResolution.current,   canvas.width, canvas.height);
      gl.uniform1f(uTime.current,         t);
      gl.uniform1f(uRms.current,          Math.min(smoothRms.current, 1.0));
      gl.uniform1f(uSensitivity.current,  sensitivity);
      gl.uniform1f(uNoise.current,        noiseRef.current);
      gl.uniform1f(uBlur.current,         blurRef.current);
      gl.uniform1f(uSpeed.current,        speedRef.current);
      gl.uniform1f(uNoiseScale.current,   noiseScaleRef.current);
      gl.uniform1f(uWarpStrength.current, warpStrengthRef.current);
      gl.uniform1f(uVerticalBias.current, verticalBiasRef.current);
      gl.uniform1f(uSaturation.current,   saturationRef.current);
      gl.uniform1f(uContrast.current,     contrastRef.current);
      gl.uniform1f(uAudioAcc.current,     audioAccRef.current);
      gl.uniform1i(uForwardOnly.current,  orbForwardOnly ? 1 : 0);

      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(progRef.current);
      glRef.current = null;
      progRef.current = null;
    };
  // Re-init if listening state changes (so the loop picks up the right audio state)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, sensitivity]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
};

export default OrbCanvas;
