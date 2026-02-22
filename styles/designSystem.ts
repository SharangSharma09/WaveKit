import { Theme } from '../types';

export const DS = {
    typography: {
        label: "text-[9px] font-bold uppercase tracking-widest",
        value: "text-[9px] font-mono",
        toggle: "text-[11px] font-bold uppercase tracking-widest",
        preset: "text-[12px] font-mono",
        footerLogo: "text-[32px] font-bold italic font-mono",
        footerText: "text-[11px] font-mono",
        exportBtn: "text-[9px] font-bold uppercase tracking-wider",
        modeLabel: "text-[9px] font-bold uppercase tracking-widest leading-none",
        sectionHeader: "text-[9px] font-bold uppercase tracking-widest"
    },
    colors: {
        dark: {
            bgMain: "bg-[#000000]",
            bgPanel: "bg-[#1C1C1C]",
            border: "border-[#37373B]",
            textPrimary: "text-white",
            textSecondary: "text-zinc-500",
            textHoverPrimary: "hover:text-white",
            textHoverSecondary: "hover:text-zinc-400",
            outlineSelected: "outline outline-1 outline-white/80 -outline-offset-1",
            hoverPanelBg: "hover:bg-[#37373B1A]",
            sliderTrack: "bg-[#37373B]",
            sliderThumb: "bg-zinc-400 border-black/50"
        },
        light: {
            bgMain: "bg-zinc-50",
            bgPanel: "bg-zinc-200",
            border: "border-zinc-300",
            textPrimary: "text-black",
            textSecondary: "text-[#555555]",
            textHoverPrimary: "hover:text-black",
            textHoverSecondary: "hover:text-zinc-700",
            outlineSelected: "outline outline-1 outline-white/40 -outline-offset-1",
            hoverPanelBg: "hover:bg-zinc-200",
            sliderTrack: "bg-zinc-400",
            sliderThumb: "bg-zinc-600 border-white/50"
        }
    }
};

export const getThemeColor = (theme: Theme, element: keyof typeof DS.colors.dark) => {
    return theme === Theme.DARK ? DS.colors.dark[element] : DS.colors.light[element];
};
