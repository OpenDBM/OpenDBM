export type DatabaseType = "mysql" | "postgres" | "mongodb" | "redis" | "sqlite" | "oracle" | "sqlserver";

export interface TableInfo {
  name: string;
  schema?: string;
  type: "table" | "view";
  rowCount?: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  comment?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface DatabaseSchema {
  name: string;
  tables: TableInfo[];
}
