import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConnectionConfig } from "@/types/connection";
import type { DatabaseType } from "@/types/database";
import { DEFAULT_PORTS } from "@/types/connection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ConnectionFormProps {
  initialValues?: Partial<ConnectionConfig>;
  onSubmit: (config: ConnectionConfig) => void;
  onTest?: (config: ConnectionConfig) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const DB_TYPES: { value: DatabaseType; label: string }[] = [
  { value: "mysql", label: "MySQL" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "sqlite", label: "SQLite" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "sqlserver", label: "SQL Server" },
  { value: "oracle", label: "Oracle" },
];

export function ConnectionForm({
  initialValues,
  onSubmit,
  onTest,
  isLoading,
  submitLabel = "Connect",
}: ConnectionFormProps) {
  const [form, setForm] = useState<ConnectionConfig>({
    name: initialValues?.name || "",
    type: initialValues?.type || "mysql",
    host: initialValues?.host || "localhost",
    port: initialValues?.port || DEFAULT_PORTS.mysql,
    username: initialValues?.username || "root",
    password: initialValues?.password || "",
    database: initialValues?.database || "",
  });

  const handleTypeChange = (type: DatabaseType) => {
    setForm((prev) => ({ ...prev, type, port: DEFAULT_PORTS[type] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isSQLite = form.type === "sqlite";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="conn-name">Connection Name</Label>
        <Input
          id="conn-name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Production Database"
          required
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label>Database Type</Label>
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/50">
          {DB_TYPES.map((dbType) => (
            <button
              key={dbType.value}
              type="button"
              className={cn(
                "rounded-md px-2 py-1.5 text-[11px] font-medium transition-all",
                form.type === dbType.value
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
              onClick={() => handleTypeChange(dbType.value)}
            >
              {dbType.label}
            </button>
          ))}
        </div>
      </div>

      {!isSQLite && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                value={form.host}
                onChange={(e) => setForm((prev) => ({ ...prev, host: e.target.value }))}
                placeholder="localhost"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={form.port}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, port: parseInt(e.target.value) || 0 }))
                }
                className="h-9 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="root"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="h-9"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="database">
          {isSQLite ? "Database File Path" : "Database"}
        </Label>
        <Input
          id="database"
          value={form.database}
          onChange={(e) => setForm((prev) => ({ ...prev, database: e.target.value }))}
          placeholder={isSQLite ? "/path/to/database.db" : "mydb"}
          className="h-9"
        />
      </div>

      <div className="flex gap-3 pt-3">
        {onTest && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onTest(form)}
            disabled={isLoading}
            className="flex-1 h-9 shadow-sm"
          >
            Test Connection
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className={cn("h-9 shadow-sm", onTest ? "flex-1" : "w-full")}
        >
          {isLoading ? "Connecting..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
