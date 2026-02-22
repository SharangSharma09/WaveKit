
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
  verticalShift: 0,
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
    { id: 'paper-1', name: 'Paper 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND }) },
    { id: 'paper-2', name: 'Paper 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { amount: 20, waves: 4 } }) },
    { id: 'paper-3', name: 'Paper 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.PAPER_BAND, paper: { amount: 8, waves: 2, speed: 1.5 } }) }
  ],
  [VisualizerMode.ENVELOPE]: [
    { id: 'envelope-1', name: 'Envelope 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE }) },
    { id: 'envelope-2', name: 'Envelope 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE, envelope: { amplitude: 60, speed: 1.5 } }) },
    { id: 'envelope-3', name: 'Envelope 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.ENVELOPE, envelope: { points: 40, opacity: 40 } }) }
  ],
  [VisualizerMode.SINO]: [
    { id: 'sino-1', name: 'Sino 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO }) },
    { id: 'sino-2', name: 'Sino 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO, sino: { amplitude: 80, speed: 2.0 } }) },
    { id: 'sino-3', name: 'Sino 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.SINO, sino: { wavelength: 150, amplitude: 30 } }) }
  ],
  [VisualizerMode.WAVE]: [
    { id: 'wave-1', name: 'Wave 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.WAVE }) },
    { id: 'wave-2', name: 'Wave 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.WAVE, wave: { amplitude: 200, noise: 40 } }) },
    { id: 'wave-3', name: 'Wave 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.WAVE, wave: { speed: 2.0, noise: 10 } }) }
  ],
  [VisualizerMode.BARS]: [
    { id: 'bars-1', name: 'Bars 1', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS }) },
    { id: 'bars-2', name: 'Bars 2', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, bars: { waves: 15, width: 20, spacing: 5 } }) },
    { id: 'bars-3', name: 'Bars 3', videoUrl: '', config: createConfig({ mode: VisualizerMode.BARS, bars: { amplitude: 150, roundness: 0, speed: 1.5 } }) }
  ],
  [VisualizerMode.SPRING_BAND]: [] // Handle properly if spring band is added
};



