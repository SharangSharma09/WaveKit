
import { VisualizerConfig, VisualizerMode } from '../types';

export interface Preset {
  id: string;
  name: string;
  videoUrl: string; // Direct link to video file
  config: VisualizerConfig;
}

const DARK_MODE_COLORS = ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#A6A6A6', '#F2C94C', '#F65CB1', '#FFFFFF'];

// Helper to create a base config and override specific fields
const createConfig = (overrides: Partial<VisualizerConfig>): VisualizerConfig => {
  const base: VisualizerConfig = {
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

  // Deep merge for nested objects would be better, but simple spread works for this flat-ish structure 
  // if we are careful to spread sub-objects in the overrides.
  return {
    ...base,
    ...overrides,
    envelope: { ...base.envelope, ...overrides.envelope },
    wave: { ...base.wave, ...overrides.wave },
    sino: { ...base.sino, ...overrides.sino },
    paper: { ...base.paper, ...overrides.paper },
    bars: { ...base.bars, ...overrides.bars }
  };
};

export const PRESETS: Preset[] = [
  {
    id: 'paper-1',
    name: 'Paper 1',
    videoUrl: 'https://cdn.dribbble.com/users/2564256/screenshots/15442571/media/1324748185790757d90d70923292408c.mp4',
    config: createConfig({
      mode: VisualizerMode.PAPER_BAND,
      sensitivity: 1.8,
      paper: {
        waves: 2,
        points: 16,
        amount: 31,
        idle: -26.2,
        strokeWidth: 12,
        moving: false,
        speed: 1,
        colors: ['#4DA3FF', '#5CE1B6']
      }
    })
  },
  {
    id: 'neon-bars',
    name: 'Neon Columns',
    // Placeholder video link - replace with real Google Drive direct link
    videoUrl: 'https://cdn.dribbble.com/users/1063462/screenshots/16382902/media/e94d6037a548231c6a7828469e88d01d.mp4', 
    config: createConfig({
      mode: VisualizerMode.BARS,
      color: '#5CE1B6',
      sensitivity: 1.8,
      bars: {
        waves: 12,
        width: 24,
        height: 45,
        spacing: 8,
        amplitude: 120,
        roundness: 100,
        moving: true,
        speed: 1.2
      }
    })
  },
  {
    id: 'silk-wave',
    name: 'Silk Band',
    videoUrl: 'https://cdn.dribbble.com/users/2564256/screenshots/15442571/media/1324748185790757d90d70923292408c.mp4',
    config: createConfig({
      mode: VisualizerMode.PAPER_BAND,
      sensitivity: 1.4,
      paper: {
        amount: 20,
        waves: 4,
        points: 20,
        idle: 3,
        strokeWidth: 4,
        colors: ['#9B8CFF', '#4DA3FF', '#5CE1B6', '#9B8CFF'],
        moving: true,
        speed: 0.8
      }
    })
  },
  {
    id: 'cyber-scope',
    name: 'Cyber Scope',
    videoUrl: 'https://cdn.dribbble.com/users/1770290/screenshots/6256972/comp_1_4.mp4',
    config: createConfig({
      mode: VisualizerMode.SINO,
      color: '#F2C94C',
      sensitivity: 2.0,
      sino: {
        amplitude: 80,
        wavelength: 200,
        speed: 2.5,
        moving: true
      }
    })
  },
  {
    id: 'flux-envelope',
    name: 'Flux Envelope',
    videoUrl: 'https://cdn.dribbble.com/users/32512/screenshots/5529142/wave_dribbble.mp4',
    config: createConfig({
      mode: VisualizerMode.ENVELOPE,
      color: '#F65CB1',
      sensitivity: 1.6,
      envelope: {
        amplitude: 100,
        speed: 1.5,
        points: 40,
        opacity: 30,
        strokeWidth: 4,
        moving: true
      }
    })
  }
];
