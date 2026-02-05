import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { QueryResult } from "@/types/database";

interface TableViewProps {
  data: QueryResult;
}

export function TableView({ data }: TableViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 20,
  });

  if (data.columns.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-muted-foreground/50">
        <p className="text-sm font-medium italic">No columns to display</p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="h-full overflow-auto bg-background custom-scrollbar">
      <div className="min-w-full inline-block align-middle">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md">
            <tr>
              <th className="border-b border-r border-border/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-muted/50 w-12 text-center">
                #
              </th>
              {data.columns.map((col) => (
                <th
                  key={col}
                  className="border-b border-r border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{col}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = data.rows[virtualRow.index];
              return (
                <tr
                  key={virtualRow.index}
                  className="absolute left-0 w-full flex border-b border-border/40 hover:bg-muted/30 transition-colors group"
                  style={{
                    top: `${virtualRow.start}px`,
                    height: `${virtualRow.size}px`,
                  }}
                >
                  <td className="flex items-center justify-center border-r border-border/40 px-3 text-[10px] font-mono text-muted-foreground/40 w-12 shrink-0 bg-muted/5 group-hover:text-muted-foreground/80 transition-colors">
                    {virtualRow.index + 1}
                  </td>
                  {data.columns.map((col) => (
                    <td
                      key={col}
                      className="flex items-center border-r border-border/40 px-4 text-xs font-mono truncate min-w-[150px] shrink-0"
                    >
                      {row[col] === null ? (
                        <span className="text-muted-foreground/40 italic text-[10px]">NULL</span>
                      ) : (
                        <span className="text-foreground/90 truncate">{String(row[col])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
