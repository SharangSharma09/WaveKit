import React, { useState, useMemo } from 'react';
import { X, Copy, CheckCircle2 } from 'lucide-react';
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
  const [copied, setCopied]             = useState(false);
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

        <div className="flex flex-1 overflow-hidden min-h-[400px]">
          {/* Single-format content area */}
          <div className={`flex-1 flex flex-col ${DS.export.contentBg} overflow-hidden`}>

            {/* React Native + Skia panel */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ── Canvas size + scale info strip ── */}
                <div className="px-6 py-4 bg-white/[0.03] border-b border-white/5 flex items-start gap-6 shrink-0">
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Dependency</span>
                    <span className="font-mono text-[11px] text-emerald-400/80 mt-1 select-all">
                      npx expo install @shopify/react-native-skia
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0 text-right">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Canvas size</span>
                    <span className={`font-mono text-sm ${DS.export.codeAmber}`}>
                      {widthMode === 'full' ? 'screen' : `${customWidth}pt`} × {targetHeight}pt
                    </span>
                    <span className="text-[10px] text-white/20">
                      scaleX&nbsp;{scaleX.toFixed(3)}&nbsp;&nbsp;scaleY&nbsp;{scaleY.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* ── Canvas width picker ── */}
                <div className="px-6 pt-4 pb-2 border-b border-white/5 shrink-0 flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Canvas Width</span>
                  <div className="flex gap-2">
                    {/* Full screen card */}
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
                          Dimensions.get
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 leading-tight block">Stretches edge-to-edge on any device</span>
                    </button>
                    {/* Fixed width card */}
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
                      <span className="text-[10px] text-white/30 leading-tight block">Use inside a card, drawer, or partial view</span>
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
                      <span className="text-[10px] text-white/30 shrink-0">pt</span>
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
                      <span className="text-[10px] text-white/30 shrink-0">pt</span>
                    </div>
                  )}
                </div>

                {/* ── Integration steps ── */}
                <div className="px-6 py-3 border-b border-white/5 flex gap-4 shrink-0 overflow-x-auto">
                  {[
                    { n: '1', text: 'Install dep above' },
                    { n: '2', text: 'Copy → WaveKitVisualizer.tsx' },
                    { n: '3', text: '<WaveKitVisualizer rms={micRms} />' },
                    { n: '4', text: 'Pass rms 0.0–1.0 from your mic' },
                  ].map((step, idx, arr) => (
                    <div key={step.n} className="flex items-center gap-2 shrink-0">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                        {step.n}
                      </span>
                      <span className="text-[11px] text-white/40 whitespace-nowrap">{step.text}</span>
                      {idx < arr.length - 1 && <span className="text-white/10 ml-2">›</span>}
                    </div>
                  ))}
                </div>

                {/* ── Code preview ── */}
                <div className="flex-1 p-6 overflow-auto custom-scrollbar">
                  <pre className={`font-mono text-xs leading-relaxed ${DS.export.codeEmerald} whitespace-pre`}>
                    {exportedContent}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/30">
          <div className="text-xs text-white/20 font-mono">WaveKitVisualizer.tsx</div>
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