import { create } from "zustand";

export interface EditorTab {
  id: string;
  title: string;
  connectionId: string;
  database: string;
  content: string;
  language: "sql" | "javascript";
  isDirty: boolean;
}

interface EditorState {
  tabs: EditorTab[];
  activeTabId: string | null;

  addTab: (tab: Omit<EditorTab, "id" | "isDirty">) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  markTabClean: (id: string) => void;
}

let tabCounter = 0;

export const useEditorStore = create<EditorState>((set) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tab) => {
    const id = `tab-${++tabCounter}`;
    set((state) => ({
      tabs: [...state.tabs, { ...tab, id, isDirty: false }],
      activeTabId: id,
    }));
  },

  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      const newActiveId =
        state.activeTabId === id
          ? newTabs.length > 0
            ? newTabs[newTabs.length - 1].id
            : null
          : state.activeTabId;
      return { tabs: newTabs, activeTabId: newActiveId };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t
      ),
    }));
  },

  markTabClean: (id) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id ? { ...t, isDirty: false } : t
      ),
    }));
  },
}));
