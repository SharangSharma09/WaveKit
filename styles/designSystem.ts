import { Theme } from '../types';

export const DS = {
    typography: {
        label: "text-[10px] font-bold uppercase tracking-widest",
        value: "text-[10px] font-mono",
        toggle: "text-[11px] font-bold uppercase tracking-widest",
        preset: "text-[10px] font-mono",
        footerLogo: "text-[32px] font-bold font-radeil",
        footerText: "text-[11px] font-mono",
        exportBtn: "text-[10px] font-bold uppercase tracking-wider",
        modeLabel: "text-[10px] font-bold uppercase tracking-widest leading-none",
        sectionHeader: "text-[10px] font-bold uppercase tracking-widest"
    },
    stroke: {
        button: "border",
        slider: "h-[1.5px]"
    },
    colors: {
        dark: {
            bgMain: "bg-[#1C1C1C]",
            bgPanel: "bg-[#1C1C1C]",
            border: "border-[#37373B]",
            textPrimary: "text-white",
            textSecondary: "text-[#71717a]",
            textHoverPrimary: "hover:text-white",
            textHoverSecondary: "hover:text-[#a1a1aa]",
            outlineSelected: "outline outline-1 outline-white/80 -outline-offset-1",
            hoverPanelBg: "hover:bg-[#37373B1A]",
            sliderTrack: "bg-[#37373B]",
            sliderThumb: "bg-[#a1a1aa] border-black/50",
            toggleOff: "border-[#37373B]",
            toggleCircleOff: "bg-zinc-600",
            homepageBg: "bg-[#1C1C1C]",
            homepageBorder: "border-[#37373B]",
            homepageText: "text-[#71717a]",
            divider: "bg-[#37373B]"
        },
        light: {
            bgMain: "bg-[#F2F2F2]",
            bgPanel: "bg-[#F2F2F2]",
            border: "border-[#d4d4d8]",
            textPrimary: "text-black",
            textSecondary: "text-[#9A9A9A]",
            textHoverPrimary: "hover:text-black",
            textHoverSecondary: "hover:text-[#3f3f46]",
            outlineSelected: "outline outline-1 outline-white/40 -outline-offset-1",
            hoverPanelBg: "hover:bg-[#e4e4e7]",
            sliderTrack: "bg-[#a1a1aa]",
            sliderThumb: "bg-[#52525b] border-white/50",
            toggleOff: "border-[#9A9A9A]",
            toggleCircleOff: "bg-[#9A9A9A]",
            homepageBg: "bg-white",
            homepageBorder: "border-[#d4d4d8]",
            homepageText: "text-[#9A9A9A]",
            divider: "bg-zinc-300"
        }
    },
    homepage: {
        bg: "bg-[#000000]",
        title: "text-white",
        description: "text-[#888888]",
        tabActive: "text-white decoration-emerald-500",
        tabInactive: "text-[#555555]",
        buttonBg: "bg-[#2a2a2a]",
        buttonBorder: "border-transparent",
        buttonHoverBorder: "hover:border-[#444]",
        buttonHoverBg: "hover:bg-[#333]",
        icon: "text-[#666666]",
        placeholderBg: "bg-[#1a1a1a]",
        placeholderBorder: "border-[#222]",
        placeholderText: "text-[#333]",
        footerText: "text-[#555555]"
    },
    picker: {
        bg: "bg-[#1A1D27]",
        border: "border-white/10",
        inputBg: "bg-black/20",
        inputText: "text-white",
        inputPlaceholder: "#FFFFFF"
    },
    export: {
        bg: "bg-[#1A1D27]",
        contentBg: "bg-[#0F1118]",
        sidebarBg: "bg-black/10",
        border: "border-white/10",
        codeBlue: "text-blue-300/90",
        codeEmerald: "text-emerald-300/80",
        codeAmber: "text-amber-400/80"
    },
    buttons: {
        dark: {
            floating: "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:text-white",
            secondary: "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
        },
        light: {
            floating: "bg-white/80 border-zinc-300 text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900",
            secondary: "bg-black/5 hover:bg-black/10 text-black/40 hover:text-black"
        }
    },
    palettes: {
        dark: ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#A6A6A6', '#F2C94C', '#F65CB1', '#FFFFFF'],
        light: ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C', '#D1D1D1', '#000000'],
        paper: ['#4DA3FF', '#5CE1B6', '#9B8CFF', '#F08BC3', '#F2C94C'],
        spring: ['#40B9F8', '#8E8EFF', '#D48EFF', '#FF87D1']
    },
    state: {
        error: {
            bg: "bg-[#2a0505]",
            border: "border-red-800",
            text: "text-red-200"
        },
        simulated: {
            bg: "bg-[#2a1c05]",
            border: "border-yellow-800",
            text: "text-yellow-200"
        }
    },
    images: {
        phoneFrame: {
            dark: "https://drive.google.com/thumbnail?id=1L193aieEtsFY3jOKwSKHrgzMJtwOhgk_&sz=w2000",
            light: "https://drive.google.com/thumbnail?id=16OLzCdy59O_8yOsV2lptj4ieru4ZKEy0&sz=w2000"
        },
        fullMobileFrame: {
            dark: "https://drive.google.com/thumbnail?id=1rRH5zxcEyCJOH-jlSjzanpNnzf53625S&sz=w2000",
            light: "https://drive.google.com/thumbnail?id=1sJ_w_UQJDbtQvM6fn1f_d12AxyZqxVcB&sz=w2000"
        },
        defaultMockup: {
            dark: "https://drive.google.com/thumbnail?id=1nmdHMYu4v_sOK5Gs44bSjuAnoLbS_Wzi&sz=w2000",
            light: "https://drive.google.com/thumbnail?id=1Y45DfpXnF2aBxVGDGJtwNfVFHJheFGHa&sz=w2000"
        }
    }
};

export const getThemeColor = (theme: Theme, element: keyof typeof DS.colors.dark) => {
    return theme === Theme.DARK ? DS.colors.dark[element] : DS.colors.light[element];
};
