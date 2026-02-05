import type { ConnectionConfig, Connection } from "../types/connection";
import type { QueryResult, TableInfo, ColumnInfo } from "../types/database";

const isDesktop = typeof window !== "undefined" && "__TAURI__" in window;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env || {};
const API_BASE = isDesktop
  ? "http://localhost:8880/api"
  : (env.VITE_API_URL || "http://localhost:8880/api");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Connection management
  async createConnection(config: ConnectionConfig): Promise<Connection> {
    return request<Connection>("/connections", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  async testConnection(config: ConnectionConfig): Promise<{ success: boolean; error?: string }> {
    return request("/connections/test", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  async listConnections(): Promise<Connection[]> {
    return request<Connection[]>("/connections");
  },

  async deleteConnection(id: string): Promise<void> {
    await request(`/connections/${id}`, { method: "DELETE" });
  },

  async disconnectConnection(id: string): Promise<void> {
    await request(`/connections/${id}/disconnect`, { method: "POST" });
  },

  // Query execution
  async executeQuery(connectionId: string, sql: string): Promise<QueryResult> {
    return request<QueryResult>("/query", {
      method: "POST",
      body: JSON.stringify({ connection_id: connectionId, sql }),
    });
  },

  // Database structure
  async listDatabases(connectionId: string): Promise<string[]> {
    return request<string[]>(`/databases/${connectionId}`);
  },

  async listTables(connectionId: string, database: string): Promise<TableInfo[]> {
    return request<TableInfo[]>(`/tables/${connectionId}/${database}`);
  },

  async getTableSchema(connectionId: string, table: string): Promise<ColumnInfo[]> {
    return request<ColumnInfo[]>(`/schema/${connectionId}/${table}`);
  },

  // MongoDB specific
  async listCollections(connectionId: string, database: string): Promise<string[]> {
    return request<string[]>(`/collections/${connectionId}/${database}`);
  },

  async findDocuments(
    connectionId: string,
    database: string,
    collection: string,
    filter: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>[]> {
    return request("/documents/find", {
      method: "POST",
      body: JSON.stringify({
        connection_id: connectionId,
        database,
        collection,
        filter,
      }),
    });
  },

  // Table data
  async getTableData(
    connectionId: string,
    database: string,
    table: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<QueryResult> {
    return request<QueryResult>(
      `/data/${connectionId}/${database}/${table}?page=${page}&page_size=${pageSize}`
    );
  },
};
