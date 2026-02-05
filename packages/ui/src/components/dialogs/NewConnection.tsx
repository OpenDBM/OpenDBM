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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Add New Connection</DialogTitle>
          <DialogDescription className="text-xs">
            Configure a new database connection. You can test it before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ConnectionForm
            onSubmit={handleSubmit}
            onTest={handleTest}
            isLoading={isLoading}
          />
        </div>

        {testResult && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-[13px] animate-in fade-in slide-in-from-top-2",
              testResult.success
                ? "bg-green-500/5 text-green-700 border-green-500/20"
                : "bg-destructive/5 text-destructive border-destructive/20"
            )}
          >
            {testResult.success ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <span className="font-semibold">{testResult.success ? "Success" : "Connection Failed"}</span>
              <p className="text-xs opacity-90 leading-relaxed font-mono break-all">{testResult.message}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
