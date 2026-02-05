import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold text-center text-foreground">
          Welcome to OpenDBM
        </h1>

        <div className="flex justify-center gap-6">
          <a href="https://vite.dev" target="_blank">
            <img
              src="/vite.svg"
              className="h-24 p-4 transition-all hover:drop-shadow-[0_0_2em_#747bff]"
              alt="Vite logo"
            />
          </a>
          <a href="https://tauri.app" target="_blank">
            <img
              src="/tauri.svg"
              className="h-24 p-4 transition-all hover:drop-shadow-[0_0_2em_#24c8db]"
              alt="Tauri logo"
            />
          </a>
          <a href="https://react.dev" target="_blank">
            <img
              src={reactLogo}
              className="h-24 p-4 transition-all hover:drop-shadow-[0_0_2em_#61dafb]"
              alt="React logo"
            />
          </a>
        </div>

        <p className="text-center text-muted-foreground">
          Click on the Tauri, Vite, and React logos to learn more.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Greet Example</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                greet();
              }}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name..."
                className="flex-1"
              />
              <Button type="submit">Greet</Button>
            </form>
            {greetMsg && (
              <p className="mt-4 text-center text-lg font-medium">{greetMsg}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default App;
