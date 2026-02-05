import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {
    theme: Theme;
    setTheme: (theme: Theme) => void;

    // Right Panel State
    isRightPanelOpen: boolean;
    activeRightPanelTab: string;
    toggleRightPanel: () => void;
    setRightPanelOpen: (open: boolean) => void;
    setActiveRightPanelTab: (tab: string) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: "system",
            setTheme: (theme) => set({ theme }),

            isRightPanelOpen: false,
            activeRightPanelTab: "ai",
            toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
            setRightPanelOpen: (open) => set({ isRightPanelOpen: open }),
            setActiveRightPanelTab: (tab) => set({ activeRightPanelTab: tab }),
        }),
        {
            name: "opendbm-ui-storage",
        }
    )
);

// Theme application logic
if (typeof window !== "undefined") {
    const applyTheme = (theme: Theme) => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
    };

    // Subscribe to changes
    useUIStore.subscribe((state) => applyTheme(state.theme));

    // Listen for system changes
    window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
            const currentTheme = useUIStore.getState().theme;
            if (currentTheme === "system") {
                applyTheme("system");
            }
        });

    // Initial application
    applyTheme(useUIStore.getState().theme);
}
