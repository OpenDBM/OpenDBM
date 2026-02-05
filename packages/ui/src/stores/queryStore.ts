import { create } from "zustand";
import type { QueryResult } from "../types/database";
import { api } from "../api/client";

interface QueryHistoryItem {
  id: string;
  connectionId: string;
  sql: string;
  executedAt: string;
  duration: number;
  rowCount: number;
  error?: string;
}

interface QueryState {
  results: Record<string, QueryResult | null>;
  isExecuting: Record<string, boolean>;
  history: QueryHistoryItem[];

  executeQuery: (tabId: string, connectionId: string, sql: string) => Promise<void>;
  clearResult: (tabId: string) => void;
  clearHistory: () => void;
}

let historyCounter = 0;

export const useQueryStore = create<QueryState>((set) => ({
  results: {},
  isExecuting: {},
  history: [],

  executeQuery: async (tabId, connectionId, sql) => {
    set((state) => ({
      isExecuting: { ...state.isExecuting, [tabId]: true },
    }));

    const startTime = Date.now();
    try {
      const result = await api.executeQuery(connectionId, sql);
      const duration = Date.now() - startTime;
      set((state) => ({
        results: { ...state.results, [tabId]: result },
        isExecuting: { ...state.isExecuting, [tabId]: false },
        history: [
          {
            id: `history-${++historyCounter}`,
            connectionId,
            sql,
            executedAt: new Date().toISOString(),
            duration,
            rowCount: result.rowCount,
          },
          ...state.history,
        ].slice(0, 100),
      }));
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = (err as Error).message;
      set((state) => ({
        results: {
          ...state.results,
          [tabId]: {
            columns: [],
            rows: [],
            rowCount: 0,
            executionTime: duration,
            error: errorMsg,
          },
        },
        isExecuting: { ...state.isExecuting, [tabId]: false },
        history: [
          {
            id: `history-${++historyCounter}`,
            connectionId,
            sql,
            executedAt: new Date().toISOString(),
            duration,
            rowCount: 0,
            error: errorMsg,
          },
          ...state.history,
        ].slice(0, 100),
      }));
    }
  },

  clearResult: (tabId) => {
    set((state) => {
      const results = { ...state.results };
      delete results[tabId];
      return { results };
    });
  },

  clearHistory: () => set({ history: [] }),
}));
