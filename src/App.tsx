import {
  AppSidebar,
  MainPanel,
  SidebarProvider,
  SidebarInset,
} from "@opendbm/ui";

function App() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MainPanel />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
