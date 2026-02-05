import type { DatabaseType } from "./database";

export interface ConnectionConfig {
  id?: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface Connection extends ConnectionConfig {
  id: string;
  status: "connected" | "disconnected" | "connecting" | "error";
  createdAt: string;
  lastConnectedAt?: string;
  error?: string;
}

export const DEFAULT_PORTS: Record<DatabaseType, number> = {
  mysql: 3306,
  postgres: 5432,
  mongodb: 27017,
  redis: 6379,
  sqlite: 0,
  oracle: 1521,
  sqlserver: 1433,
};
