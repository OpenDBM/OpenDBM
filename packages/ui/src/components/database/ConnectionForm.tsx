import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConnectionConfig } from "@/types/connection";
import type { DatabaseType } from "@/types/database";
import { DEFAULT_PORTS } from "@/types/connection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSshStore } from "@/stores/sshStore";
import { useConnectionStore } from "@/stores/connectionStore";
import { SshManager } from "@/components/dialogs/SshManager";
import { Settings2, Terminal, Plus, Folder } from "lucide-react";

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
  const { tunnels } = useSshStore();
  const { groups } = useConnectionStore();
  const [isSshManagerOpen, setIsSshManagerOpen] = useState(false);

  const [form, setForm] = useState<ConnectionConfig>({
    name: initialValues?.name || "",
    groupId: initialValues?.groupId || undefined,
    type: initialValues?.type || "mysql",
    host: initialValues?.host || "localhost",
    port: initialValues?.port || DEFAULT_PORTS.mysql,
    username: initialValues?.username || "root",
    password: initialValues?.password || "",
    database: initialValues?.database || "",
    // SSH
    useSsh: initialValues?.useSsh || false,
    sshTunnelId: initialValues?.sshTunnelId || "",
    // SSL
    useSsl: initialValues?.useSsl || false,
    sslCaPath: initialValues?.sslCaPath || "",
    sslCertPath: initialValues?.sslCertPath || "",
    sslKeyPath: initialValues?.sslKeyPath || "",
    sslRejectUnauthorized: initialValues?.sslRejectUnauthorized ?? true,
    // Advanced
    connectTimeout: initialValues?.connectTimeout || 10,
    maxPoolSize: initialValues?.maxPoolSize || 10,
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
    <div className="flex flex-col h-full max-h-[600px]">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-1">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-10 bg-muted/30 p-1 mb-6">
            <TabsTrigger value="general" className="text-[11px] font-bold tracking-tight uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
            <TabsTrigger value="ssh" className="text-[11px] font-bold tracking-tight uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">SSH</TabsTrigger>
            <TabsTrigger value="ssl" className="text-[11px] font-bold tracking-tight uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">SSL</TabsTrigger>
            <TabsTrigger value="advanced" className="text-[11px] font-bold tracking-tight uppercase transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conn-name" className="text-xs font-semibold text-foreground/70">Connection Name</Label>
                <Input
                  id="conn-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. My Database"
                  required
                  className="h-9 glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/70">Group</Label>
                <Select
                  value={form.groupId || "none"}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, groupId: val === "none" ? undefined : val }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="No Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>No Group</span>
                      </div>
                    </SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-3.5 w-3.5 opacity-50" />
                          <span>{group.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/70">Database Type</Label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted/20 rounded-lg border border-border/40">
                  {DB_TYPES.map((dbType) => (
                    <button
                      key={dbType.value}
                      type="button"
                      className={cn(
                        "rounded-md px-1 py-1.5 text-[10px] font-bold uppercase transition-all",
                        form.type === dbType.value
                          ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                          : "text-muted-foreground/60 hover:bg-background/40 hover:text-foreground"
                      )}
                      onClick={() => handleTypeChange(dbType.value)}
                    >
                      {dbType.value.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {!isSQLite && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="host" className="text-xs font-semibold text-foreground/70">Host</Label>
                    <Input
                      id="host"
                      value={form.host}
                      onChange={(e) => setForm((prev) => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-xs font-semibold text-foreground/70">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={form.port}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, port: parseInt(e.target.value) || 0 }))
                      }
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {!isSQLite && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-semibold text-foreground/70">Username</Label>
                    <Input
                      id="username"
                      value={form.username}
                      onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="root"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground/70">Password</Label>
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
              )}

              <div className="space-y-2">
                <Label htmlFor="database" className="text-xs font-semibold text-foreground/70">
                  {isSQLite ? "File Path" : "Database"}
                </Label>
                <Input
                  id="database"
                  value={form.database}
                  onChange={(e) => setForm((prev) => ({ ...prev, database: e.target.value }))}
                  placeholder={isSQLite ? "/path/to/db.sqlite" : "postgres"}
                  className="h-9"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ssh" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/5">
              <div className="space-y-1">
                <Label htmlFor="use-ssh" className="text-sm font-bold tracking-tight">Use SSH Tunnel</Label>
                <p className="text-[10px] text-muted-foreground/70">Securely connect to remote servers</p>
              </div>
              <Switch
                id="use-ssh"
                checked={form.useSsh}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, useSsh: checked }))}
              />
            </div>

            {form.useSsh && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground/70">Select Tunnel</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-[10px] font-bold uppercase tracking-tight gap-1"
                      onClick={() => setIsSshManagerOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Manage Tunnels
                    </Button>
                  </div>
                  <Select
                    value={form.sshTunnelId}
                    onValueChange={(val) => setForm((prev) => ({ ...prev, sshTunnelId: val }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select an SSH tunnel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tunnels.length === 0 ? (
                        <div className="py-6 px-2 text-center">
                          <p className="text-xs text-muted-foreground">No tunnels found</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-[10px]"
                            onClick={() => setIsSshManagerOpen(true)}
                          >
                            Create First Tunnel
                          </Button>
                        </div>
                      ) : (
                        tunnels.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex items-center gap-2">
                              <Terminal className="h-3 w-3 opacity-50" />
                              <span className="font-medium">{t.name}</span>
                              <span className="text-[10px] opacity-40 font-mono">({t.username}@{t.host})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {form.sshTunnelId && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-primary/80">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Tunnel active for this connection</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary"
                      onClick={() => setForm(prev => ({ ...prev, sshTunnelId: "" }))}
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ssl" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/5">
              <div className="space-y-1">
                <Label htmlFor="use-ssl" className="text-sm font-bold tracking-tight">Use SSL Connection</Label>
                <p className="text-[10px] text-muted-foreground/70">Encrypted communication with database</p>
              </div>
              <Switch
                id="use-ssl"
                checked={form.useSsl}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, useSsl: checked }))}
              />
            </div>

            {form.useSsl && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground/70">CA Certificate Path</Label>
                  <Input
                    value={form.sslCaPath}
                    onChange={(e) => setForm((prev) => ({ ...prev, sslCaPath: e.target.value }))}
                    placeholder="/path/to/server-ca.pem"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/70">Client Cert Path</Label>
                    <Input
                      value={form.sslCertPath}
                      onChange={(e) => setForm((prev) => ({ ...prev, sslCertPath: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground/70">Client Key Path</Label>
                    <Input
                      value={form.sslKeyPath}
                      onChange={(e) => setForm((prev) => ({ ...prev, sslKeyPath: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="reject-unauthorized"
                    checked={form.sslRejectUnauthorized}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, sslRejectUnauthorized: !!checked }))}
                  />
                  <Label htmlFor="reject-unauthorized" className="text-[11px] text-muted-foreground">Reject Unauthorized (Secure)</Label>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Connection Limits</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px]">Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={form.connectTimeout}
                      onChange={(e) => setForm((prev) => ({ ...prev, connectTimeout: parseInt(e.target.value) || 0 }))}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px]">Max Pool Size</Label>
                    <Input
                      type="number"
                      value={form.maxPoolSize}
                      onChange={(e) => setForm((prev) => ({ ...prev, maxPoolSize: parseInt(e.target.value) || 0 }))}
                      className="h-9"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-muted/5 flex items-start gap-3">
                <Settings2 className="h-4 w-4 mt-0.5 text-primary opacity-60" />
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-tight">Driver Settings</span>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    Custom query parameters can be added to the connection string for specific driver behavior.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-6 mt-6 border-t bg-background/50 backdrop-blur-sm relative z-10">
          {onTest && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onTest(form)}
              disabled={isLoading}
              className="flex-1 h-10 text-[11px] font-bold uppercase tracking-wider"
            >
              Test Connection
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn("flex-1 h-10 text-[11px] font-bold uppercase tracking-wider", onTest ? "flex-1" : "w-full")}
          >
            {isLoading ? "PROCESSSING..." : submitLabel.toUpperCase()}
          </Button>
        </div>
      </form>

      <SshManager
        open={isSshManagerOpen}
        onOpenChange={setIsSshManagerOpen}
      />
    </div>
  );
}
