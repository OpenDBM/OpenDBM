import { GripVertical } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof Group>) => (
    <Group
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
)

const ResizablePanel = Panel

const ResizableHandle = ({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof Separator> & {
    withHandle?: boolean
}) => (
    <Separator
        className={cn(
            "relative flex w-2 items-center justify-center bg-transparent transition-all cursor-col-resize z-50 hover:bg-primary/5 data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize",
            className
        )}
        {...props}
    >
        <div className="pointer-events-none h-full w-px bg-border group-hover:bg-primary/50" />
        {withHandle && (
            <div className="z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-4 w-3 items-center justify-center rounded-sm border bg-background shadow-sm border-muted-foreground/20">
                <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
        )}
    </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
