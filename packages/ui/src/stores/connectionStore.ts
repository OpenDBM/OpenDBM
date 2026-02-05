import { create } from "zustand";
import type { Connection, ConnectionConfig, Group } from "../types/connection";
import { api } from "../api/client";

interface ConnectionState {
  connections: Connection[];
  groups: Group[];
  activeConnectionId: string | null;
  isLoading: boolean;
  error: string | null;

  addConnection: (config: ConnectionConfig) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  testConnection: (
    config: ConnectionConfig
  ) => Promise<{ success: boolean; error?: string }>;
  setActiveConnection: (id: string | null) => void;
  disconnectConnection: (id: string) => Promise<void>;
  refreshConnections: () => Promise<void>;
  clearError: () => void;

  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
}

const loadGroups = (): Group[] => {
  try {
    const stored = localStorage.getItem("opendbm_groups");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveGroups = (groups: Group[]) => {
  try {
    localStorage.setItem("opendbm_groups", JSON.stringify(groups));
  } catch (err) {
    console.error("Failed to save groups", err);
  }
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: [],
  groups: loadGroups(),
  activeConnectionId: null,
  isLoading: false,
  error: null,

  addConnection: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const conn = await api.createConnection(config);
      set((state) => ({
        connections: [...state.connections, conn],
        activeConnectionId: conn.id,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  removeConnection: async (id) => {
    try {
      await api.deleteConnection(id);
      set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
        activeConnectionId:
          state.activeConnectionId === id ? null : state.activeConnectionId,
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  testConnection: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.testConnection(config);
      set({ isLoading: false });
      if (!result.success) {
        set({ error: result.error || "Connection test failed" });
      }
      return result;
    } catch (err) {
      const errorMessage = (err as Error).message;
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  setActiveConnection: (id) => {
    set({ activeConnectionId: id });
  },

  disconnectConnection: async (id) => {
    try {
      await api.disconnectConnection(id);
      set((state) => ({
        connections: state.connections.map((c) =>
          c.id === id ? { ...c, status: "disconnected" as const } : c
        ),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  refreshConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const connections = await api.listConnections();
      set({ connections, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  addGroup: (name) => {
    set((state) => {
      const newGroup = { id: crypto.randomUUID(), name };
      const newGroups = [...state.groups, newGroup];
      saveGroups(newGroups);
      return { groups: newGroups };
    });
  },

  removeGroup: (id) => {
    set((state) => {
      const newGroups = state.groups.filter((g) => g.id !== id);
      saveGroups(newGroups);
      // Also potentially update connections to remove groupId?
      // For now, let's just keep connections in "ungrouped" if group disappears.
      return { groups: newGroups };
    });
  },
}));
