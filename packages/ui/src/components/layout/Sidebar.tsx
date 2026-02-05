import { useState } from "react";
import { cn } from "@/lib/utils";
import { useConnectionStore } from "@/stores/connectionStore";
import { useEditorStore } from "@/stores/editorStore";
import { useUIStore, type Theme } from "@/stores/uiStore";
import { DatabaseTree } from "@/components/database/DatabaseTree";
import { NewConnection } from "@/components/dialogs/NewConnection";
import {
  Database,
  Plus,
  RefreshCw,
  Settings,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const { connections, activeConnectionId, setActiveConnection, refreshConnections, isLoading } = useConnectionStore();
  const { addTab } = useEditorStore();
  const { theme, setTheme } = useUIStore();

  const handleSelectTable = (connectionId: string, database: string, table: string) => {
    setActiveConnection(connectionId);
    addTab({
      title: `${table}.sql`,
      connectionId,
      database,
      content: `SELECT * FROM ${table} LIMIT 100;`,
      language: "sql",
    });
  };

  const getThemeIcon = (t: Theme) => {
    switch (t) {
      case "light": return <Sun className="mr-2 h-4 w-4" />;
      case "dark": return <Moon className="mr-2 h-4 w-4" />;
      case "system": return <Laptop className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r bg-sidebar/40 text-sidebar-foreground backdrop-blur-md",
        className
      )}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary/80" />
          <span className="font-bold tracking-tight text-sm opacity-90">OpenDBM</span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setIsNewConnectionOpen(true)}
          className="hover:bg-sidebar-accent/50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 pt-2">
          <div className="space-y-0.5">
            {connections.length === 0 ? (
              <p className="px-4 py-4 text-[11px] text-muted-foreground/60 italic leading-relaxed">
                No active connections. Click the plus icon to get started.
              </p>
            ) : (
              connections.map((conn) => (
                <DatabaseTree
                  key={conn.id}
                  connection={conn}
                  isActive={activeConnectionId === conn.id}
                  onSelect={() => setActiveConnection(conn.id)}
                  onSelectTable={(db, table) => handleSelectTable(conn.id, db, table)}
                />
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="mt-auto p-2">
        <div className="flex items-center justify-between gap-1 rounded-lg bg-muted/30 p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 justify-start gap-2 text-[10px] font-medium opacity-70 hover:opacity-100"
            onClick={() => refreshConnections()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Separator orientation="vertical" className="h-4 opacity-50" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="h-8 w-8 opacity-70 hover:bg-sidebar-accent/50 hover:opacity-100">
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48">
              <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <Database className="mr-2 h-4 w-4" />
                Connection Manager
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Metadata
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs">
                  {getThemeIcon(theme)}
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                    <DropdownMenuRadioItem value="light" className="text-xs">
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className="text-xs">
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system" className="text-xs">
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <NewConnection
        open={isNewConnectionOpen}
        onOpenChange={setIsNewConnectionOpen}
      />
    </div>
  );
}
