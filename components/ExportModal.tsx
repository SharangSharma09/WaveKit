import React, { useState, useMemo } from 'react';
import { X, Copy, CheckCircle2, Terminal, Rocket, Settings2, Ghost } from 'lucide-react';
import { VisualizerConfig } from '../types';
import { generateReactNativeCode } from '../utils/exportTemplates';
import { DS } from '../styles/designSystem';

// Web canvas reference dimensions (must match VisualizerEditor.tsx)
const WEB_CANVAS_WIDTH  = 784; // default containerWidth
const WEB_CANVAS_HEIGHT = 576; // VIRTUAL_HEIGHT 640 * CSS scale-90
const DEFAULT_MOBILE_WIDTH = 390;

type WidthMode  = 'full' | 'fixed';
type HeightMode = 'proportional' | 'compact' | 'custom';

const HEIGHT_OPTIONS: { id: HeightMode; label: string; description: string; getValue: (refW: number, cw: number) => number }[] = [
  {
    id: 'proportional',
    label: 'Proportional',
    description: 'Preserves aspect ratio — identical look to web',
    getValue: (refW, cw) => Math.round(refW * (WEB_CANVAS_HEIGHT / (cw || WEB_CANVAS_WIDTH))),
  },
  {
    id: 'compact',
    label: 'Compact Strip',
    description: '150pt — fits under a music player bar',
    getValue: () => 150,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Type or drag to any height',
    getValue: () => 200,
  },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VisualizerConfig;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config }) => {
  const [activeTab, setActiveTab]       = useState<'guide' | 'export'>('guide');
  const [copied, setCopied]             = useState(false);
  const [depCopied, setDepCopied]       = useState(false);
  // Width
  const [widthMode, setWidthMode]       = useState<WidthMode>('full');
  const [customWidth, setCustomWidth]   = useState(DEFAULT_MOBILE_WIDTH);
  // Height
  const [heightMode, setHeightMode]     = useState<HeightMode>('proportional');
  const [customHeight, setCustomHeight] = useState(200);

  // Resolved pixel targets (undefined width = full-screen / Dimensions.get)
  const targetWidth = useMemo(() => {
    if (widthMode === 'full')  return undefined;   // Dimensions.get at runtime
    return customWidth;
  }, [widthMode, customWidth]);

  const refWidth = targetWidth ?? DEFAULT_MOBILE_WIDTH;

  const targetHeight = useMemo(() => {
    if (heightMode === 'proportional') return HEIGHT_OPTIONS[0].getValue(refWidth, config.containerWidth);
    if (heightMode === 'compact')      return 150;
    return customHeight;
  }, [heightMode, customHeight, refWidth, config.containerWidth]);

  const scaleX = refWidth   / (config.containerWidth || WEB_CANVAS_WIDTH);
  const scaleY = targetHeight / WEB_CANVAS_HEIGHT;

  const exportedContent = useMemo(
    () => generateReactNativeCode(config, targetHeight, targetWidth),
    [config, targetHeight, targetWidth]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyDep = () => {
    navigator.clipboard.writeText('npx expo install @shopify/react-native-skia');
    setDepCopied(true);
    setTimeout(() => setDepCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className={`relative w-full max-w-3xl ${DS.export.bg} ${DS.stroke.button} ${DS.export.border} rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Export Visualization</h2>
            <p className="text-sm text-white/40 mt-1">Get production-ready code for your visualizer.</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-8 border-b border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'guide'
                ? 'border-white text-white'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            <Rocket size={14} />
            Quick Start Guide
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'export'
                ? 'border-white text-white'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            <Settings2 size={14} />
            Export Options & Code
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-[440px]">
          {/* Main content area */}
          <div className={`flex-1 flex flex-col ${DS.export.contentBg} overflow-hidden`}>

            {/* TAB 1: QUICK START GUIDE */}
            {activeTab === 'guide' && (
              <div className="flex-1 overflow-auto custom-scrollbar p-8">
                <div className="max-w-2xl mx-auto space-y-10">
                  
                  {/* Step 1: Install */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">1</div>
                      <h3 className="text-white font-bold">Install Dependencies</h3>
                    </div>
                    <p className="text-sm text-white/40 mb-4 ml-11">
                      WaveKit visualizers use @shopify/react-native-skia for hardware-accelerated 60fps rendering.
                    </p>
                    <div className="ml-11 flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-4 group">
                      <Terminal size={14} className="text-white/20" />
                      <code className="flex-1 font-mono text-[11px] text-emerald-400">
                        npx expo install @shopify/react-native-skia
                      </code>
                      <button 
                        onClick={handleCopyDep}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/40 hover:text-white"
                      >
                        {depCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </section>

                  {/* Step 2: Copy File */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">2</div>
                      <h3 className="text-white font-bold">Create Component File</h3>
                    </div>
                    <p className="text-sm text-white/40 mb-3 ml-11">
                      Create a new file named <code className="text-white/60 bg-white/5 px-1.5 py-0.5 rounded">WaveKitVisualizer.tsx</code> in your project.
                    </p>
                    <div className="ml-11 p-4 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                        <Ghost size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-white/60">WaveKitVisualizer.tsx</div>
                        <div className="text-[10px] text-white/20">Copy the code from the Export tab info this file</div>
                      </div>
                    </div>
                  </section>

                  {/* Step 3: Implementation */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">3</div>
                      <h3 className="text-white font-bold">Real-time Implementation</h3>
                    </div>
                    <p className="text-sm text-white/40 mb-4 ml-11 leading-relaxed">
                      Pass a live <code className="text-white/60 bg-white/5 px-1.5 py-0.5 rounded">rms</code> value (0.0 to 1.0) into the component. 
                      This value usually comes from your audio recording or playback library.
                    </p>
                    <div className="ml-11 bg-black/40 border border-white/5 rounded-2xl p-6 overflow-hidden">
                      <pre className="font-mono text-[10px] leading-relaxed text-white/50">
{`// Example usage with a mock RMS loop
import { WaveKitVisualizer } from './WaveKitVisualizer';

export default function MyScreen() {
  const [rms, setRms] = useState(0);

  // You would typically hook this up to expo-av recording
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WaveKitVisualizer rms={rms} />
    </View>
  );
}`}
                      </pre>
                    </div>
                  </section>

                </div>
              </div>
            )}

            {/* TAB 2: EXPORT OPTIONS & CODE */}
            {activeTab === 'export' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* ── Canvas size + scale info strip ── */}
                <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-start gap-6 shrink-0">
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Target Dimensions</span>
                    <span className={`font-mono text-sm ${DS.export.codeAmber}`}>
                      {widthMode === 'full' ? 'screen' : `${customWidth}pt`} × {targetHeight}pt
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Active Scaling</span>
                    <span className="text-[10px] text-white/40 font-mono">
                      X&nbsp;{scaleX.toFixed(3)}&nbsp;&nbsp;Y&nbsp;{scaleY.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* ── Canvas width picker ── */}
                <div className="px-6 pt-4 pb-2 border-b border-white/5 shrink-0 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Canvas Width</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWidthMode('full')}
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        widthMode === 'full'
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold">Full Screen</span>
                        <span className={`font-mono text-[11px] ${widthMode === 'full' ? DS.export.codeAmber : 'text-white/20'}`}>
                          Auto
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 leading-tight block">Dimensions.get('window')</span>
                    </button>
                    <button
                      onClick={() => setWidthMode('fixed')}
                      className={`flex-1 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        widthMode === 'fixed'
                          ? 'bg-white/10 border-white/30 text-white'
                          : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold">Fixed Width</span>
                        <span className={`font-mono text-[11px] ${widthMode === 'fixed' ? DS.export.codeAmber : 'text-white/20'}`}>
                          {customWidth}pt
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 leading-tight block">Custom clip view</span>
                    </button>
                  </div>

                  {/* Fixed width controls */}
                  {widthMode === 'fixed' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider shrink-0">Width (pt)</span>
                      <input
                        type="range"
                        min={80}
                        max={600}
                        step={10}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(parseInt(e.target.value))}
                        className="flex-1 h-[2px] accent-white cursor-pointer"
                      />
                      <input
                        type="number"
                        min={80}
                        max={600}
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Math.max(80, Math.min(600, parseInt(e.target.value) || DEFAULT_MOBILE_WIDTH)))}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-white text-center focus:outline-none focus:border-white/30"
                      />
                    </div>
                  )}
                </div>

                {/* ── Canvas height picker ── */}
                <div className="px-6 pt-4 pb-3 border-b border-white/5 shrink-0 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Canvas Height</span>
                  <div className="flex gap-2">
                    {HEIGHT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setHeightMode(opt.id)}
                        className={`flex-1 px-3 py-2.5 rounded-xl border text-left transition-all ${
                          heightMode === opt.id
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-bold">{opt.label}</span>
                          <span className={`font-mono text-[11px] ${
                            heightMode === opt.id ? DS.export.codeAmber : 'text-white/20'
                          }`}>
                            {opt.id === 'custom' ? `${customHeight}pt` : `${opt.getValue(refWidth, config.containerWidth)}pt`}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/30 leading-tight block">{opt.description}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom height input */}
                  {heightMode === 'custom' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider shrink-0">Height (pt)</span>
                      <input
                        type="range"
                        min={80}
                        max={600}
                        step={10}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(parseInt(e.target.value))}
                        className="flex-1 h-[2px] accent-white cursor-pointer"
                      />
                      <input
                        type="number"
                        min={80}
                        max={600}
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Math.max(80, Math.min(600, parseInt(e.target.value) || 200)))}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-mono text-white text-center focus:outline-none focus:border-white/30"
                      />
                    </div>
                  )}
                </div>

                {/* ── Code preview ── */}
                <div className="flex-1 p-6 overflow-auto custom-scrollbar">
                  <pre className={`font-mono text-[11px] leading-relaxed ${DS.export.codeEmerald} whitespace-pre`}>
                    {exportedContent}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-4">
            <div className="text-xs text-white/20 font-mono">WaveKitVisualizer.tsx</div>
          </div>
          
          <div className="flex gap-3">
            {activeTab === 'guide' ? (
              <button
                onClick={() => setActiveTab('export')}
                className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95"
              >
                Go to Export <Settings2 size={18} />
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white text-black px-10 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                {copied ? (
                  <><CheckCircle2 size={18} /> Copied!</>
                ) : (
                  <><Copy size={18} /> Copy Code</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default ExportModal;