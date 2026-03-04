# Full Mobile Preview Guide

This document serves as a reference for managing the elements within the **Full Mobile Preview** component in `VisualizerEditor.tsx`. Use this as a guide when communicating with AI agents to maintain and update the interactive phone mockup.

## 📱 Component Architecture
The Full Mobile Preview is built using a layered stack of containers and images to simulate an iPhone mockup. Understanding these layers is key to modifying the layout, buttons, or backgrounds.

### Layer Stack (Back to Front)

| Hierarchy | Element | Container/Component | `z-index` | Key Class Names / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | **Theme Background** | Screen Container `div` | Base | `bgColor`, `rounded-[40px]`. The "physical" screen area. |
| **L1** | **Mockup Images** | `<img>` Tag | `z-0` | `object-cover`, `inset-0`. Displays default (White/Black) or uploaded mockup. Uses `referrerPolicy="no-referrer"`. |
| **L2** | **Visualizer Canvas** | `VisualizerCanvas` Container `div` | `z-10` | `origin-center`, `flex`. Houses the waves/bars logic. |
| **L3** | **Front Image** | Phone Frame `<img>` Tag | `z-10` | The blue/black physical iPhone bezel frame PNG. Uses `pointer-events-none` to allow clicking through the glass. |
| **L4** | **Control Stack** | Control Layer `div` | `z-30` | `flex-col`, `pt-12`. Contains **Upload** and **Remove** buttons. Visible only on **hover**. |

---

### 🔍 Key Div Identifiers

#### Outer Overlay Container
`fixed inset-0 z-[100] flex items-center justify-center`
*   The parent wrapper that covers the entire browser screen.

#### Background Backdrop
`absolute inset-0 bg-black/85 cursor-pointer`
*   The semi-transparent black background behind the phone.

#### Internal Screen Div (The "Hardware" Screen)
`style={{ width: '354px', height: '766px' }}`
*   The actual display area inside the phone frame.

#### Canvas Container Div
`className="relative z-10 transition-all duration-300 transform origin-center flex items-center justify-center pointer-events-none"`
*   The div that wraps the actual visualization (waves, etc.). Use this for scaling or repositioning the visualization.

#### Button Stack Div
`className="absolute inset-0 flex flex-col items-center justify-start pt-12 gap-3 z-30..."`
*   The container for the upload and clear mockup buttons.

---

### 🛠️ Common Modification Tasks

1.  **Changing Backgrounds**: Update `FULL_MOBILE_DARK_DEFAULT` or `FULL_MOBILE_LIGHT_DEFAULT` constants at the top of the file.
2.  **Repositioning Visualization**: Adjust the `scale` or `width` of the **Canvas Container Div**.
3.  **Updating Buttons**: Look for the **Control Stack** block in the code. It currently uses `Upload` and `Trash2` icons from `lucide-react`.
4.  **Fixing Image Loads**: Ensure all external images use `referrerPolicy="no-referrer"` to bypass permission blocks.
