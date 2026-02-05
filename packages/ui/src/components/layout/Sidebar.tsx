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
  Sun,
  Moon,
  Laptop,
  ChevronRight,
  User,
  ChevronsUpDown,
  LogOut,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as SidebarUI,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  className?: string;
}

export function AppSidebar({ className }: SidebarProps) {
  const [isNewConnectionOpen, setIsNewConnectionOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const { connections, groups, activeConnectionId, setActiveConnection, addGroup, removeGroup } = useConnectionStore();
  const { addTab } = useEditorStore();
  const { setTheme } = useUIStore();
  const { theme } = useUIStore();

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
    <>
      <SidebarUI collapsible="icon" className={cn("border-r bg-sidebar/40 backdrop-blur-md", className)}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Database className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground/90">OpenDBM</span>
                  <span className="truncate text-xs text-muted-foreground/70 text-[10px]">Development</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              Platform
            </SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Connections" className="hover:bg-sidebar-accent/50 transition-colors">
                      <Database className="size-4 h-4 w-4 opacity-70" />
                      <span className="font-medium opacity-90">Connections</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 size-4 opacity-50" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-1 py-1">
                      {/* Groups */}
                      {groups.length > 0 && (
                        <div className="space-y-0.5 ml-4 border-l pl-2 border-muted-foreground/10 mb-1">
                          {groups.map((group) => {
                            const groupConnections = connections.filter(c => c.groupId === group.id);
                            return (
                              <Collapsible key={group.id} className="group/folder">
                                <SidebarMenuItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="h-7 text-xs hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground">
                                      <Folder className="size-3.5 mr-1 opacity-70" />
                                      <span className="font-medium flex-1 truncate">{group.name}</span>
                                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/folder:rotate-90 size-3 opacity-50" />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <div className="absolute right-1 top-0.5 opacity-0 group-hover/folder:opacity-100 transition-opacity">
                                        <button className="h-6 w-6 flex items-center justify-center rounded-sm hover:bg-sidebar-accent text-muted-foreground">
                                          <MoreHorizontal className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem onClick={() => removeGroup(group.id)} className="text-destructive focus:text-destructive text-xs">
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete Folder
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <CollapsibleContent>
                                    <div className="ml-2 pl-2 border-l border-muted-foreground/10 space-y-0.5 py-0.5">
                                      {groupConnections.length === 0 ? (
                                        <p className="px-2 py-1 text-[10px] text-muted-foreground/50 italic">Empty</p>
                                      ) : (
                                        groupConnections.map((conn) => (
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
                                  </CollapsibleContent>
                                </SidebarMenuItem>
                              </Collapsible>
                            );
                          })}
                        </div>
                      )}

                      {/* Ungrouped Connections */}
                      <div className="space-y-0.5 ml-4 border-l pl-2 border-muted-foreground/10">
                        {connections.filter(c => !c.groupId || !groups.find(g => g.id === c.groupId)).map((conn) => (
                          <DatabaseTree
                            key={conn.id}
                            connection={conn}
                            isActive={activeConnectionId === conn.id}
                            onSelect={() => setActiveConnection(conn.id)}
                            onSelectTable={(db, table) => handleSelectTable(conn.id, db, table)}
                          />
                        ))}
                      </div>

                      {connections.length === 0 && groups.length === 0 && (
                        <p className="px-6 py-2 text-[11px] text-muted-foreground/60 italic leading-relaxed">
                          No connections.
                        </p>
                      )}

                      <div className="flex items-center gap-1 mt-1 ml-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="h-7 text-[11px] text-muted-foreground/70 hover:text-foreground">
                              <Plus className="mr-2 h-3 w-3" />
                              Add...
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-40">
                            <DropdownMenuItem onClick={() => setIsNewConnectionOpen(true)} className="text-xs">
                              <Database className="mr-2 h-3.5 w-3.5 opacity-70" />
                              New Connection
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsNewGroupOpen(true)} className="text-xs">
                              <FolderPlus className="mr-2 h-3.5 w-3.5 opacity-70" />
                              New Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

            </SidebarMenu>
          </SidebarGroup>

        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border bg-muted/50">
                      <AvatarImage src="" alt="User" />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground/90 text-xs">shadcn</span>
                      <span className="truncate text-muted-foreground/70 text-[10px]">m@example.com</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">OP</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">OpenDBM User</span>
                        <span className="truncate text-xs text-muted-foreground">user@opendbm.com</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
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
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4 opacity-70" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </SidebarUI>

      <NewConnection
        open={isNewConnectionOpen}
        onOpenChange={setIsNewConnectionOpen}
      />

      <AddGroupDialog
        open={isNewGroupOpen}
        onOpenChange={setIsNewGroupOpen}
        onSubmit={addGroup}
      />
    </>
  );
}

function AddGroupDialog({ open, onOpenChange, onSubmit }: { open: boolean, onOpenChange: (o: boolean) => void, onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-sm">Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="group-name" className="text-xs">Group Name</Label>
            <Input id="group-name" value={name} onChange={e => setName(e.target.value)} className="h-8 text-xs" autoFocus />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">Cancel</Button>
            <Button type="submit" size="sm" className="h-8 text-xs">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
