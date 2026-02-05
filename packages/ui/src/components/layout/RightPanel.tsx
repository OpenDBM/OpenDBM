import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Sparkles,
    History,
    Info,
    Send,
    MoreVertical,
    X,
    Bot,
    User,
    Copy,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useState } from "react";

export function RightPanel() {
    const { activeRightPanelTab, setActiveRightPanelTab, setRightPanelOpen } = useUIStore();
    const activeTab = activeRightPanelTab || "ai"; // Fallback to 'ai' if undefined
    const [input, setInput] = useState("");

    const tabs = [
        { id: "ai", icon: Sparkles, label: "AI Assistant" },
        { id: "history", icon: History, label: "History" },
        { id: "info", icon: Info, label: "Info" },
    ];

    return (
        <div className="flex h-full w-full bg-background border-l">
            {/* Sidebar Strip */}
            <div className="flex flex-col items-center py-4 w-12 border-r bg-muted/5 gap-4">
                <TooltipProvider>
                    {tabs.map((tab) => (
                        <Tooltip key={tab.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-lg transition-all",
                                        activeTab === tab.id
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => setActiveRightPanelTab(tab.id)}
                                >
                                    <tab.icon className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                                {tab.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>

                <div className="mt-auto flex flex-col gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => setRightPanelOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                                Close Sidebar
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 h-12 border-b bg-muted/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">AI Assistant</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[10px] font-medium text-primary">Beta</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4 opacity-70" />
                    </Button>
                </div>

                {/* Chat Area */}
                {activeTab === "ai" && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {/* Welcome Message */}
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 mt-0.5 border bg-primary/5 shrink-0">
                                        <AvatarFallback className="bg-transparent"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold">OpenDBM AI</span>
                                            <span className="text-[10px] text-muted-foreground">Just now</span>
                                        </div>
                                        <div className="text-sm text-foreground/90 leading-relaxed bg-muted/10 p-3 rounded-tr-xl rounded-b-xl border border-border/50">
                                            <p>Hello! I can help you write queries, analyze performance, or explain database schemas. How can I assist you today?</p>
                                        </div>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><ThumbsDown className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>

                                {/* User Mock Message */}
                                <div className="flex gap-3 flex-row-reverse">
                                    <Avatar className="h-8 w-8 mt-0.5 border bg-muted shrink-0">
                                        <AvatarFallback><User className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="text-[10px] text-muted-foreground">2m ago</span>
                                            <span className="text-xs font-semibold">You</span>
                                        </div>
                                        <div className="text-sm text-primary-foreground leading-relaxed bg-primary p-3 rounded-tl-xl rounded-b-xl ml-auto w-fit max-w-[90%] shadow-sm">
                                            <p>Show me the top 5 users by transaction volume.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Response Mock */}
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 mt-0.5 border bg-primary/5 shrink-0">
                                        <AvatarFallback className="bg-transparent"><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold">OpenDBM AI</span>
                                            <span className="text-[10px] text-muted-foreground">1m ago</span>
                                        </div>
                                        <div className="text-sm text-foreground/90 leading-relaxed bg-muted/10 p-3 rounded-tr-xl rounded-b-xl border border-border/50">
                                            <p className="mb-2">Here is the query to find the top 5 users based on total transaction amount:</p>
                                            <div className="bg-background border rounded-md p-2 font-mono text-xs my-2 overflow-x-auto">
                                                <div className="flex items-center justify-between mb-1 pb-1 border-b border-border/50 text-muted-foreground">
                                                    <span>SQL</span>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4"><Copy className="h-2.5 w-2.5" /></Button>
                                                </div>
                                                <code className="block">
                                                    SELECT u.name, SUM(t.amount) as total_volume<br />
                                                    FROM users u<br />
                                                    JOIN transactions t ON u.id = t.user_id<br />
                                                    GROUP BY u.id<br />
                                                    ORDER BY total_volume DESC<br />
                                                    LIMIT 5;
                                                </code>
                                            </div>
                                            <p>Would you like me to explain how the `JOIN` works?</p>
                                        </div>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-4 pt-2 border-t bg-background shrink-0">
                            <div className="relative rounded-xl border bg-muted/20 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                                <Textarea
                                    value={input}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                                    placeholder="Ask AI anything about your database..."
                                    className="min-h-[50px] max-h-[200px] border-none bg-transparent resize-none p-3 pr-10 focus-visible:ring-0 text-sm placeholder:text-muted-foreground/50 shadow-none"
                                />
                                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                    <Button size="icon" className="h-7 w-7 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-50" disabled={!input.trim()}>
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center mt-2">
                                <span className="text-[10px] text-muted-foreground/50">AI can make mistakes. Verify important info.</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-2">
                        <History className="h-10 w-10 opacity-20" />
                        <p className="text-sm font-medium">No chat history</p>
                        <p className="text-xs opacity-60">Your recent conversations will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
