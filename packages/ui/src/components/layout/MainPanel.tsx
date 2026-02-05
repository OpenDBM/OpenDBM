import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { useQueryStore } from "@/stores/queryStore";
import { useConnectionStore } from "@/stores/connectionStore";
import { useUIStore } from "@/stores/uiStore";
import { SqlEditor } from "@/components/editor/SqlEditor";
import { QueryResultPanel } from "@/components/editor/QueryResult";
import { X, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@opendbm/ui";

interface MainPanelProps {
  className?: string;
}

export function MainPanel({ className }: MainPanelProps) {
  const { tabs, activeTabId, setActiveTab, removeTab, updateTabContent } = useEditorStore();
  const { activeConnectionId } = useConnectionStore();
  const { results, isExecuting, executeQuery } = useQueryStore();
  const { isRightPanelOpen, toggleRightPanel } = useUIStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeResult = activeTabId ? results[activeTabId] : null;
  const isCurrentlyExecuting = activeTabId ? isExecuting[activeTabId] : false;

  const handleRunQuery = async () => {
    if (!activeTab || !activeConnectionId) return;
    await executeQuery(activeTab.id, activeConnectionId, activeTab.content);
  };

  if (tabs.length === 0) {
    return (
      <div className={cn("flex flex-1 flex-col bg-background", className)}>
        <div className="flex h-12 items-center bg-muted/5 px-4">
          <SidebarTrigger className="-ml-1 mr-2" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground/80">No queries open</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a table from the sidebar or create a new query
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden bg-background", className)}>
      {/* Tab Bar Area */}
      <div className="flex h-12 items-center justify-between bg-muted/5">
        <div className="flex items-center flex-1 overflow-hidden h-full">
          <SidebarTrigger className="-ml-1 mr-2 ml-2" />
          <Tabs value={activeTabId || ""} onValueChange={setActiveTab} className="flex-1 overflow-hidden h-full">
            <ScrollArea className="w-full h-full">
              <TabsList className="h-full w-max justify-start rounded-none bg-transparent p-0 gap-0">
                {tabs.map((tab) => (
                  <div key={tab.id} className="relative flex items-center h-full">
                    <TabsTrigger
                      value={tab.id}
                      className={cn(
                        "relative h-full gap-2 rounded-none border-none px-4 py-0 text-[11px] font-medium transition-all data-[state=active]:bg-background/80 data-[state=active]:shadow-none",
                        "hover:bg-muted/30"
                      )}
                    >
                      <span className={cn("truncate max-w-[120px] opacity-70 data-[state=active]:opacity-100", tab.isDirty && "italic")}>
                        {tab.isDirty && "• "}
                        {tab.title}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full p-0 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTab(tab.id);
                        }}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                      {tab.id === activeTabId && (
                        <div className="absolute inset-x-2 bottom-0 h-0.5 rounded-t-full bg-primary/60" />
                      )}
                    </TabsTrigger>
                  </div>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </Tabs>
        </div>

        {/* Right Actions */}
        <div className="flex items-center h-full pr-4 gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7 px-3 text-[10px] font-bold tracking-tight rounded-md shadow-sm"
            onClick={handleRunQuery}
            disabled={!activeTab || !activeConnectionId || isCurrentlyExecuting}
          >
            <Play className={cn("mr-1.5 h-3 w-3 fill-current", isCurrentlyExecuting && "animate-pulse")} />
            {isCurrentlyExecuting ? "EXECUTING" : "RUN"}
          </Button>

          <Button
            variant={isRightPanelOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleRightPanel}
            title="Toggle AI Assistant"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor & Results Split View */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab && (
          <>
            <div className="flex-[2] border-b overflow-hidden">
              <SqlEditor
                value={activeTab.content}
                onChange={(value) => updateTabContent(activeTab.id, value || "")}
                language={activeTab.language}
              />
            </div>
            <div className="flex-[3] overflow-hidden bg-muted/5">
              <QueryResultPanel result={activeResult} isLoading={isCurrentlyExecuting} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
