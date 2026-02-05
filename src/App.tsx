import {
  AppSidebar,
  MainPanel,
  SidebarProvider,
  SidebarInset,
  RightPanel,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  useUIStore,
  cn
} from "@opendbm/ui";

function App() {
  const { isRightPanelOpen } = useUIStore();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={100} minSize={50}>
            <MainPanel />
          </ResizablePanel>

          {isRightPanelOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={20} maxSize={50} className={cn("transition-all duration-300 ease-in-out")}>
                <RightPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
