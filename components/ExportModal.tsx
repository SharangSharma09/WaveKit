import React, { useState, useMemo } from 'react';
import { X, Copy, Download, Code2, PlayCircle, CheckCircle2 } from 'lucide-react';
import { ExportType, VisualizerConfig } from '../types';
import { generateThreeJSCode, generateLottiePreset } from '../utils/exportTemplates';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VisualizerConfig;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config }) => {
  const [exportType, setExportType] = useState<ExportType>(ExportType.JS_THREE);
  const [copied, setCopied] = useState(false);

  const exportedContent = useMemo(() => {
    if (exportType === ExportType.JS_THREE) return generateThreeJSCode(config);
    if (exportType === ExportType.LOTTIE) return generateLottiePreset(config);
    return '';
  }, [exportType, config]);

  const handleAction = () => {
    if (exportType === ExportType.JS_THREE) {
      navigator.clipboard.writeText(exportedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      const blob = new Blob([exportedContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visualizer_${config.mode.toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#1A1D27] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 p-6 flex flex-col gap-3 bg-black/10">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-4">Formats</span>
            <button
              onClick={() => setExportType(ExportType.JS_THREE)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                exportType === ExportType.JS_THREE ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Code2 size={18} />
              <span className="font-semibold text-sm">Three.js</span>
            </button>
            <button
              onClick={() => setExportType(ExportType.LOTTIE)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                exportType === ExportType.LOTTIE ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <PlayCircle size={18} />
              <span className="font-semibold text-sm">Lottie JSON</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col bg-[#0F1118] overflow-hidden">
            {exportType === ExportType.JS_THREE ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Code Preview</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-auto custom-scrollbar">
                  <pre className="font-mono text-xs leading-relaxed text-blue-300/90 whitespace-pre">
                    {exportedContent}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center">
                <div className="max-w-xs">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <PlayCircle size={40} className="text-white/20" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">Lottie Preset</h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-8">
                    Generate a deterministic animation file. Perfect for web and mobile apps using the Lottie player.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-green-400/60 font-mono uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    Ready for download
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between bg-black/30">
          <div className="text-xs text-white/20 font-mono">
            {exportType === ExportType.JS_THREE ? 'index.html' : 'animation.json'}
          </div>
          <button
            onClick={handleAction}
            className="flex items-center gap-2 bg-white text-black px-10 py-4 rounded-2xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            {exportType === ExportType.JS_THREE ? (
              copied ? <><CheckCircle2 size={18} /> Copied!</> : <><Copy size={18} /> Copy Code</>
            ) : (
              <><Download size={18} /> Download Asset</>
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