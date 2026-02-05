import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/stores/connectionStore";
import { useQueryStore } from "@/stores/queryStore";
import { Database, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StatusBarProps {
  className?: string;
}

export function StatusBar({ className }: StatusBarProps) {
  const { connections, activeConnectionId } = useConnectionStore();
  const { history } = useQueryStore();

  const activeConnection = connections.find((c) => c.id === activeConnectionId);
  const lastQuery = history[0];

  return (
    <div
      className={cn(
        "flex h-7 items-center justify-between border-t bg-muted/40 px-4 text-[11px] text-muted-foreground select-none",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {activeConnection ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 pt-0.5">
              <Database className="h-3 w-3 text-primary/70" />
              <span className="font-medium text-foreground/80">
                {activeConnection.name}
              </span>
              <span className="text-muted-foreground/60">({activeConnection.type})</span>
            </div>
            <Separator orientation="vertical" className="h-3 mx-1" />
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  activeConnection.status === "connected"
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    : activeConnection.status === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                )}
              />
              <span className="capitalize">{activeConnection.status}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            <span>No active connection</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {lastQuery && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {lastQuery.error ? (
                <Badge variant="destructive" className="h-4 px-1.5 py-0 text-[9px] uppercase tracking-wider font-bold">Error</Badge>
              ) : (
                <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[9px] uppercase tracking-wider font-bold bg-green-500/10 text-green-600 border-green-500/20">Success</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 opacity-60" />
              <span>{lastQuery.duration}ms</span>
            </div>
            {!lastQuery.error && (
              <div className="flex items-center gap-1">
                <span className="opacity-60">Rows:</span>
                <span className="font-mono">{lastQuery.rowCount}</span>
              </div>
            )}
            <Separator orientation="vertical" className="h-3" />
          </div>
        )}
        <div className="flex items-center gap-1 font-medium opacity-80">
          <span>OpenDBM</span>
          <span className="text-[10px] opacity-60">v0.1.0</span>
        </div>
      </div>
    </div>
  );
}
