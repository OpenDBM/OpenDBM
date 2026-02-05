import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSshStore } from "@/stores/sshStore";
import { SshTunnelForm } from "@/components/database/SshTunnelForm";
import { Plus, Trash2, Edit2, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SshManagerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SshManager({ open, onOpenChange }: SshManagerProps) {
    const { tunnels, addTunnel, updateTunnel, removeTunnel } = useSshStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const activeTunnel = tunnels.find((t) => t.id === editingId);

    const handleClose = () => {
        onOpenChange(false);
        setEditingId(null);
        setIsAdding(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold tracking-tight">SSH Tunnels</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground/60">
                                Manage reusable secure tunnels for your connections.
                            </DialogDescription>
                        </div>
                        {!isAdding && !editingId && (
                            <Button size="sm" onClick={() => setIsAdding(true)} className="h-8 gap-1.5 px-3">
                                <Plus className="h-3.5 w-3.5" />
                                Add New
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6">
                    {isAdding || editingId ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <SshTunnelForm
                                initialValues={activeTunnel}
                                onSubmit={(config) => {
                                    if (editingId) {
                                        updateTunnel(editingId, config);
                                    } else {
                                        addTunnel(config);
                                    }
                                    setIsAdding(false);
                                    setEditingId(null);
                                }}
                                onCancel={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                }}
                                submitLabel={editingId ? "Update Tunnel" : "Add Tunnel"}
                            />
                        </div>
                    ) : (
                        <ScrollArea className="h-[350px] pr-4">
                            {tunnels.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12 opacity-40">
                                    <Terminal className="h-12 w-12 mb-4" />
                                    <p className="text-sm font-medium">No SSH tunnels configured yet</p>
                                    <p className="text-[11px] mt-1">Create a tunnel to reuse it across multiple connections</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tunnels.map((tunnel) => (
                                        <div
                                            key={tunnel.id}
                                            className="group flex items-center justify-between p-4 rounded-xl border bg-muted/5 hover:bg-muted/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Terminal className="h-4 w-4" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[13px] font-bold tracking-tight">{tunnel.name}</p>
                                                    <p className="text-[11px] text-muted-foreground/70 font-mono">
                                                        {tunnel.username}@{tunnel.host}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setEditingId(tunnel.id)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeTunnel(tunnel.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
