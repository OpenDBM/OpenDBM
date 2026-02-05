import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface UIState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: "system",
            setTheme: (theme) => set({ theme }),
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
