import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SshConfig } from "@/types/connection";

interface SshStore {
    tunnels: SshConfig[];
    addTunnel: (tunnel: SshConfig) => void;
    updateTunnel: (id: string, tunnel: Partial<SshConfig>) => void;
    removeTunnel: (id: string) => void;
    getTunnel: (id: string) => SshConfig | undefined;
}

export const useSshStore = create<SshStore>()(
    persist(
        (set, get) => ({
            tunnels: [],
            addTunnel: (tunnel) =>
                set((state) => ({ tunnels: [...state.tunnels, tunnel] })),
            updateTunnel: (id, updatedTunnel) =>
                set((state) => ({
                    tunnels: state.tunnels.map((t) =>
                        t.id === id ? { ...t, ...updatedTunnel } : t
                    ),
                })),
            removeTunnel: (id) =>
                set((state) => ({
                    tunnels: state.tunnels.filter((t) => t.id !== id),
                })),
            getTunnel: (id) => get().tunnels.find((t) => t.id === id),
        }),
        {
            name: "ssh-storage",
        }
    )
);
