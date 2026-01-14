
export interface AudioMetrics {
  rms: number;      // Root Mean Square (Volume/Intensity)
  frequencyData: Uint8Array; // Raw frequency data for more complex visuals if needed
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK'
}

export enum VisualizerMode {
  WAVE = 'WAVE',
  BARS = 'BARS',
  SINO = 'SINO',
  SPRING_BAND = 'SPRING_BAND',
  ENVELOPE = 'ENVELOPE',
  PAPER_BAND = 'PAPER_BAND'
}

export enum ExportType {
  JS_THREE = 'JS_THREE',
  LOTTIE = 'LOTTIE'
}

export interface VisualizerConfig {
  mode: VisualizerMode;
  sensitivity: number;
  color: string;
  palette: string[];
  containerWidth: number;
  verticalShift: number;
  envelope: {
    amplitude: number;
    speed: number;
    points: number;
    opacity: number;
  };
  wave: {
    amplitude: number;
    noise: number;
  };
  sino: {
    amplitude: number;
    wavelength: number;
    speed: number;
  };
  paper: {
    amount: number;
    waves: number;
    points: number;
    idle: number;
  };
}