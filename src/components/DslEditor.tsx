import React from "react";
import Editor from "@monaco-editor/react";
import type { DslFormat } from "@/lib/dsl-parser";

interface DslEditorProps {
  value: string;
  onChange: (value: string) => void;
  format: DslFormat;
}

const DslEditor: React.FC<DslEditorProps> = ({ value, onChange, format }) => {
  return (
    <Editor
      height="100%"
      language={format === "json" ? "json" : "yaml"}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme="vs-dark"
      options={{
        fontSize: 13,
        fontFamily: "'JetBrains Mono', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        renderLineHighlight: "line",
        tabSize: 2,
        automaticLayout: true,
        padding: { top: 12 },
        wordWrap: "on",
      }}
    />
  );
};

export default DslEditor;
