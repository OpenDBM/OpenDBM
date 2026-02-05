import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ConnectionForm } from "@/components/database/ConnectionForm";
import { useConnectionStore } from "@/stores/connectionStore";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface NewConnectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConnection({ open, onOpenChange }: NewConnectionProps) {
  const { addConnection, testConnection, isLoading } = useConnectionStore();
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (config: Parameters<typeof addConnection>[0]) => {
    await addConnection(config);
    onOpenChange(false);
    setTestResult(null);
  };

  const handleTest = async (config: Parameters<typeof testConnection>[0]) => {
    const result = await testConnection(config);
    setTestResult({
      success: result.success,
      message: result.success
        ? "Connection successful!"
        : result.error || "Connection failed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTestResult(null);
    }}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden gap-0 border-none shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/5">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground/90">New Connection</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/60">
            Configure secure access to your database instance.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-2 overflow-y-auto max-h-[70vh]">
          <ConnectionForm
            onSubmit={handleSubmit}
            onTest={handleTest}
            isLoading={isLoading}
          />
        </div>

        {testResult && (
          <div className="px-6 pb-6 pt-2">
            <div
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 text-[13px] animate-in fade-in slide-in-from-top-2",
                testResult.success
                  ? "bg-green-500/5 text-green-700 border-green-500/20"
                  : "bg-destructive/5 text-destructive border-destructive/20 shadow-sm"
              )}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              )}
              <div className="space-y-1">
                <span className="font-bold tracking-tight">{testResult.success ? "CONNECTIVITY SUCCESS" : "CONNECTION FAILED"}</span>
                <p className="text-[11px] opacity-80 leading-relaxed font-mono break-all whitespace-pre-wrap">{testResult.message}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
