import type { QueryResult as QueryResultType } from "@/types/database";
import { TableView } from "@/components/database/TableView";
import {
  AlertCircle,
  Loader2,
  Database,
  Clock,
  List,
  Download,
  Copy,
  ChevronDown,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface QueryResultPanelProps {
  result: QueryResultType | null | undefined;
  isLoading: boolean;
}

export function QueryResultPanel({ result, isLoading }: QueryResultPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    const csv = [
      result.columns.join(","),
      ...result.rows.map(row => result.columns.map(col => String(row[col])).join(","))
    ].join("\n");
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/5 animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">Executing query...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground/60 bg-muted/5">
        <Database className="h-10 w-10 mb-2 opacity-20" />
        <p className="text-sm font-medium">Run a query to see results</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full overflow-auto p-6 bg-destructive/5 animate-in fade-in slide-in-from-bottom-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-bold tracking-tight">Query Execution Failed</h3>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-background/50 p-5 shadow-sm">
            <pre className="text-xs font-mono leading-relaxed text-destructive/90 whitespace-pre-wrap break-all">
              {result.error}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in">
      <div className="flex h-9 items-center justify-between border-b bg-muted/10 px-4">
        <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground/60">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-muted/20">
            <List className="h-3 w-3 opacity-70" />
            <span className="font-mono text-foreground/70">{result.rowCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-muted/20">
            <Clock className="h-3 w-3 opacity-70" />
            <span className="font-mono text-foreground/70">{result.executionTime}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[10px] font-medium opacity-60 hover:opacity-100"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 mr-1.5 text-green-500" /> : <Copy className="h-3 w-3 mr-1.5" />}
            {copied ? "COPIED" : "COPY CSV"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-medium opacity-60 hover:opacity-100">
                <Download className="h-3 w-3 mr-1.5" />
                EXPORT
                <ChevronDown className="h-2.5 w-2.5 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="text-[11px] font-medium">Export as CSV</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-medium">Export as JSON</DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] font-medium">Export as SQL</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <TableView data={result} />
      </div>
    </div>
  );
}
