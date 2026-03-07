
import { VisualizerConfig, VisualizerMode } from '../types';

export interface Preset {
  id: string;
  name: string;
  videoUrl: string; // Direct link to video file
  config: VisualizerConfig;
}

const DARK_MODE_COLORS = ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#A6A6A6', '#F2C94C', '#F65CB1', '#FFFFFF'];

export const BASE_CONFIG: VisualizerConfig = {
  mode: VisualizerMode.BARS,
  sensitivity: 1.5,
  color: DARK_MODE_COLORS[0],
  palette: DARK_MODE_COLORS,
  containerWidth: 784,
  verticalShift: -2,
  envelope: {
    amplitude: 40,
    speed: 1,
    points: 20,
    opacity: 20,
    strokeWidth: 6,
    moving: false
  },
  wave: {
    amplitude: 150,
    noise: 20,
    speed: 1,
    moving: true
  },
  sino: {
    amplitude: 40,
    wavelength: 300,
    speed: 1.0,
    moving: false
  },
  paper: {
    amount: 12,
    waves: 3,
    points: 10,
    idle: 2,
    strokeWidth: 6,
    colors: ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C'],
    moving: false,
    speed: 1
  },
  bars: {
    waves: 10,
    width: 32,
    height: 50,
    spacing: 10,
    amplitude: 100,
    roundness: 100,
    moving: false,
    speed: 1
  }
};

// Helper to create a base config and override specific fields
export const createConfig = (overrides: any): VisualizerConfig => {
  // Deep merge for nested objects would be better, but simple spread works for this flat-ish structure 
  // if we are careful to spread sub-objects in the overrides.
  return {
    ...BASE_CONFIG,
    ...overrides,
    envelope: { ...BASE_CONFIG.envelope, ...overrides.envelope },
    wave: { ...BASE_CONFIG.wave, ...overrides.wave },
    sino: { ...BASE_CONFIG.sino, ...overrides.sino },
    paper: { ...BASE_CONFIG.paper, ...overrides.paper },
    bars: { ...BASE_CONFIG.bars, ...overrides.bars }
  };
};

export const PRESETS_BY_MODE: Record<VisualizerMode, Preset[]> = {
  [VisualizerMode.PAPER_BAND]: [
    { id: 'paper-1', name: 'Paper 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { waves: 3, points: 10, amount: 12, idle: 2.0, strokeWidth: 6, moving: false, colors: ['#4DA3FF', '#5CE1B6', '#9B8CFF'] } }) },
    { id: 'paper-2', name: 'Paper 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { waves: 1, points: 42, amount: 23, idle: -5.7, strokeWidth: 8, moving: true, speed: 2.4, colors: ['#F65CB1'] } }) },
    { id: 'paper-3', name: 'Paper 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { waves: 5, points: 42, amount: 23, idle: -5.7, strokeWidth: 8, moving: false, colors: ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C'] } }) },
    { id: 'paper-4', name: 'Paper 4', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { waves: 3, points: 10, amount: 2, idle: -5.7, strokeWidth: 8, moving: true, speed: 1.4, colors: ['#4DA3FF', '#5CE1B6', '#9B8CFF'] } }) }
  ],
  [VisualizerMode.ENVELOPE]: [
    { id: 'envelope-1', name: 'Envelope 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE, sensitivity: 2.9, color: '#9B8CFF', envelope: { amplitude: 40, points: 60, opacity: 0, strokeWidth: 12, moving: false } }) },
    { id: 'envelope-2', name: 'Envelope 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE, sensitivity: 1.5, color: '#5CE1B6', envelope: { amplitude: 32, points: 20, opacity: 42, strokeWidth: 8, moving: true, speed: 1.0 } }) },
    { id: 'envelope-3', name: 'Envelope 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE, sensitivity: 4.0, color: '#5CE1B6', envelope: { amplitude: 58, points: 49, opacity: 100, strokeWidth: 6, moving: true, speed: 0.8 } }) }
  ],
  [VisualizerMode.SINO]: [
    { id: 'sino-1', name: 'Sino 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO, color: '#4DA3FF', sensitivity: 4.0, sino: { amplitude: 12, wavelength: 168, moving: false, speed: 1.0 } }) },
    { id: 'sino-2', name: 'Sino 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO, color: '#9B8CFF', sensitivity: 4.0, sino: { amplitude: 53, wavelength: 317, moving: true, speed: 1.1 } }) },
    { id: 'sino-3', name: 'Sino 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO, color: '#9B8CFF', sensitivity: 4.0, sino: { amplitude: 83, wavelength: 72, moving: true, speed: 0.8 } }) }
  ],
  [VisualizerMode.WAVE]: [
    { id: 'wave-1', name: 'Wave 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.WAVE, color: '#4DA3FF', sensitivity: 4.0, wave: { amplitude: 150, noise: 20, moving: true, speed: 0.5 } }) },
    { id: 'wave-2', name: 'Wave 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.WAVE, color: '#5CE1B6', sensitivity: 4.0, wave: { amplitude: -46, noise: 0, moving: false } }) }
  ],
  [VisualizerMode.BARS]: [
    { id: 'bars-1', name: 'Bars 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, color: '#000000', sensitivity: 2.1, bars: { waves: 5, width: 25, spacing: 16, amplitude: 56, height: 25, roundness: 92, moving: false } }) },
    { id: 'bars-2', name: 'Bars 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, color: '#5CE1B6', sensitivity: 1.5, bars: { waves: 15, width: 20, spacing: 15, amplitude: 137, height: 29, roundness: 2, moving: true, speed: 3.0 } }) },
    { id: 'bars-3', name: 'Bars 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, color: '#4DA3FF', sensitivity: 1.5, bars: { waves: 20, width: 17, spacing: 9, amplitude: 150, height: 17, roundness: 100, moving: false } }) },
    { id: 'bars-4', name: 'Bars 4', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, color: '#F2C94C', sensitivity: 1.5, bars: { waves: 12, width: 4, spacing: 13, amplitude: 150, height: 13, roundness: 100, moving: false } }) }
  ],
  [VisualizerMode.SPRING_BAND]: [] // Handle properly if spring band is added
};

export const PRESETS = Object.values(PRESETS_BY_MODE).flat();



