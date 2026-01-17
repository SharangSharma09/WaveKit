import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Pipette } from 'lucide-react';
import { hexToHsv, hsvToHex, isValidHex, HSV } from '../utils/colorUtils';

interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  variant?: 'add' | 'swatch';
}

const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange, variant = 'add' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hsv, setHsv] = useState<HSV>(hexToHsv(color));
  const [hexInput, setHexInput] = useState(color);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const isDraggingSaturation = useRef(false);
  const isDraggingHue = useRef(false);

  // Sync internal state when external prop changes, but only if not currently dragging/editing
  useEffect(() => {
    if (!isOpen) {
       const newHsv = hexToHsv(color);
       setHsv(newHsv);
       setHexInput(color);
    }
  }, [color, isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const updateColorFromHsv = useCallback((newHsv: HSV) => {
    setHsv(newHsv);
    const newHex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(newHex);
    onChange(newHex);
  }, [onChange]);

  // -- Interaction Handlers --

  const handleSaturationMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const s = x * 100;
    const v = (1 - y) * 100;
    
    updateColorFromHsv({ ...hsv, s, v });
  }, [hsv, updateColorFromHsv]);

  const handleHueMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    
    const h = x * 360;
    updateColorFromHsv({ ...hsv, h });
  }, [hsv, updateColorFromHsv]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (isValidHex(val)) {
      const newHsv = hexToHsv(val);
      setHsv(newHsv);
      onChange(val);
    }
  };

  // Global Mouse Events for Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSaturation.current) {
        handleSaturationMove(e);
      } else if (isDraggingHue.current) {
        handleHueMove(e);
      }
    };

    const handleMouseUp = () => {
      isDraggingSaturation.current = false;
      isDraggingHue.current = false;
    };

    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleSaturationMove, handleHueMove]);


  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${
           variant === 'swatch' ? 'shadow-sm' : 'bg-white/5 hover:bg-white/10'
        } ${isOpen ? 'ring-2 ring-white/50' : ''}`}
        style={variant === 'swatch' ? { backgroundColor: color } : {}}
        title="Custom Color"
      >
        {variant === 'add' && <Plus size={12} className="text-white/60" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1D27] border border-white/10 rounded-xl p-3 w-[240px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
           
           {/* Visual Picker Area */}
           <div className="space-y-3">
              
              {/* Saturation/Value Box */}
              <div 
                ref={saturationRef}
                className="w-full h-32 rounded-lg cursor-crosshair relative overflow-hidden"
                style={{
                  backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                  backgroundImage: `
                    linear-gradient(to top, #000, transparent), 
                    linear-gradient(to right, #fff, transparent)
                  `
                }}
                onMouseDown={(e) => {
                  isDraggingSaturation.current = true;
                  handleSaturationMove(e);
                }}
              >
                <div 
                  className="absolute w-3 h-3 border-2 border-white rounded-full shadow-sm -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{
                    left: `${hsv.s}%`,
                    top: `${100 - hsv.v}%`,
                    boxShadow: '0 0 2px rgba(0,0,0,0.5)'
                  }}
                />
              </div>

              {/* Hue Slider */}
              <div 
                ref={hueRef}
                className="w-full h-3 rounded-full cursor-pointer relative"
                style={{
                  background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                }}
                onMouseDown={(e) => {
                  isDraggingHue.current = true;
                  handleHueMove(e);
                }}
              >
                <div 
                  className="absolute top-0 w-3 h-3 bg-white rounded-full border border-black/20 shadow-sm -translate-x-1/2 pointer-events-none"
                  style={{ left: `${(hsv.h / 360) * 100}%` }}
                />
              </div>

              {/* Hex Input & Preview */}
              <div className="flex items-center gap-2 pt-1">
                 <div 
                   className="w-8 h-8 rounded-lg border border-white/10 shrink-0 shadow-inner" 
                   style={{ backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
                 />
                 <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">HEX</span>
                    <input 
                      type="text" 
                      value={hexInput} 
                      onChange={handleHexChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-1.5 pl-10 pr-2 text-xs font-mono text-white focus:outline-none focus:border-white/30 uppercase"
                      placeholder="#FFFFFF"
                      maxLength={7}
                    />
                 </div>
              </div>
           </div>

           {/* Arrow Indicator */}
           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1D27] border-r border-b border-white/10 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default CustomColorPicker;