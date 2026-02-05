import type { DatabaseType } from "./database";

export type SshAuthMethod = "password" | "key";

export interface SshConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authMethod: SshAuthMethod;
  password?: string;
  keyPath?: string;
  passphrase?: string;
}

export interface ConnectionConfig {
  id?: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  groupId?: string;

  // Reusable SSH Tunnel
  useSsh?: boolean;
  sshTunnelId?: string;

  // SSL
  useSsl?: boolean;
  sslCaPath?: string;
  sslCertPath?: string;
  sslKeyPath?: string;
  sslRejectUnauthorized?: boolean;

  // Advanced
  connectTimeout?: number;
  maxPoolSize?: number;
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

export interface Group {
  id: string;
  name: string;
}
