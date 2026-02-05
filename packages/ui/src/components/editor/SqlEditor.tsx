import Editor from "@monaco-editor/react";
import { useUIStore } from "@/stores/uiStore";
import { useEffect, useState } from "react";

interface SqlEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: "sql" | "javascript";
}

export function SqlEditor({ value, onChange, language = "sql" }: SqlEditorProps) {
  const { theme } = useUIStore();
  const [monacoTheme, setMonacoTheme] = useState("vs-dark");

  useEffect(() => {
    const resolveTheme = () => {
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "vs-dark"
          : "vs";
      }
      return theme === "dark" ? "vs-dark" : "vs";
    };

    setMonacoTheme(resolveTheme());

    // Listen for system theme changes if set to system
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setMonacoTheme(resolveTheme());
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={monacoTheme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 8 },
        suggestOnTriggerCharacters: true,
      }}
    />
  );
}
