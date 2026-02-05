import { Sidebar, MainPanel, StatusBar } from "@opendbm/ui";

function App() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default App;
