import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Connection } from "@/types/connection";
import { api } from "@/api/client";
import {
  Database,
  Table,
  Trash2,
  Unplug,
  Loader2,
} from "lucide-react";
import { useConnectionStore } from "@/stores/connectionStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface DatabaseTreeProps {
  connection: Connection;
  isActive: boolean;
  onSelect: () => void;
  onSelectTable: (database: string, table: string) => void;
}

interface DatabaseNode {
  name: string;
  tables: string[];
  isLoading: boolean;
}

export function DatabaseTree({ connection, isActive, onSelect, onSelectTable }: DatabaseTreeProps) {
  const [databases, setDatabases] = useState<DatabaseNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { removeConnection, disconnectConnection } = useConnectionStore();

  const loadDatabases = async () => {
    if (databases.length > 0 || connection.status !== "connected") return;
    setIsLoading(true);
    try {
      const dbs = await api.listDatabases(connection.id);
      setDatabases(dbs.map((name) => ({ name, tables: [], isLoading: false })));
    } catch {
      // silently fail
    }
    setIsLoading(false);
  };

  const loadTables = async (dbIndex: number) => {
    const db = databases[dbIndex];
    if (db.tables.length > 0) return;
    setDatabases((prev) => {
      const next = [...prev];
      next[dbIndex] = { ...next[dbIndex], isLoading: true };
      return next;
    });
    try {
      const tables = await api.listTables(connection.id, db.name);
      setDatabases((prev) => {
        const next = [...prev];
        next[dbIndex] = { ...next[dbIndex], tables: tables.map((t) => t.name), isLoading: false };
        return next;
      });
    } catch {
      setDatabases((prev) => {
        const next = [...prev];
        next[dbIndex] = { ...next[dbIndex], isLoading: false };
        return next;
      });
    }
  };

  const statusColor =
    connection.status === "connected"
      ? "text-green-500"
      : connection.status === "connecting"
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <TooltipProvider>
      <div className="mb-0.5">
        <Accordion type="single" collapsible onValueChange={(value) => {
          if (value === "connection") {
            onSelect();
            loadDatabases();
          }
        }}>
          <AccordionItem value="connection" className="border-none">
            <div
              className={cn(
                "group flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <AccordionTrigger className="p-0 hover:no-underline [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-50">
                <Database className={cn("h-3.5 w-3.5 shrink-0", statusColor)} />
                <span className="truncate flex-1 text-left ml-1.5">{connection.name}</span>
              </AccordionTrigger>

              <div className="hidden items-center gap-1 group-hover:flex ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="rounded p-1 hover:bg-background/20 transition-colors"
                      onClick={(e) => { e.stopPropagation(); disconnectConnection(connection.id); }}
                    >
                      <Unplug className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Disconnect</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="rounded p-1 hover:bg-destructive/20 hover:text-destructive transition-colors"
                      onClick={(e) => { e.stopPropagation(); removeConnection(connection.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Remove</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <AccordionContent className="pb-0 pl-2">
              <div className="ml-3 mt-1 border-l border-sidebar-border pl-2 space-y-0.5">
                {isLoading ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground italic">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Loading databases...</span>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full" onValueChange={(value) => {
                    if (value) {
                      const index = databases.findIndex(db => db.name === value);
                      if (index !== -1) loadTables(index);
                    }
                  }}>
                    {databases.map((db) => (
                      <AccordionItem key={db.name} value={db.name} className="border-none">
                        <AccordionTrigger
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors hover:no-underline [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:opacity-50",
                            "text-muted-foreground hover:bg-sidebar-accent/30 hover:text-foreground data-[state=open]:text-foreground"
                          )}
                        >
                          <Database className="h-3 w-3 opacity-70" />
                          <span className="truncate flex-1 text-left">{db.name}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pl-2">
                          <div className="ml-3 mt-0.5 border-l border-sidebar-border/50 pl-2 space-y-0.5">
                            {db.isLoading ? (
                              <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-muted-foreground italic">
                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                <span>Loading tables...</span>
                              </div>
                            ) : db.tables.length === 0 ? (
                              <p className="px-2 py-1 text-[10px] text-muted-foreground italic pl-4">No tables found</p>
                            ) : (
                              db.tables.map((table) => (
                                <button
                                  key={table}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:bg-sidebar-accent/30 hover:text-foreground transition-colors group"
                                  onClick={() => onSelectTable(db.name, table)}
                                >
                                  <Table className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                                  <span className="truncate">{table}</span>
                                </button>
                              ))
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </TooltipProvider>
  );
}
