import React from "react";
import { TEMPLATES } from "@/lib/default-template";
import type { DslRoot } from "@/lib/dsl-schema";

interface GlobalToolbarProps {
  mode: "wireframe" | "ui";
  onModeChange: (mode: "wireframe" | "ui") => void;
  onLoadTemplate: (dsl: string) => void;
  ast: DslRoot | null;
}

const GlobalToolbar: React.FC<GlobalToolbarProps> = ({ mode, onModeChange, onLoadTemplate, ast }) => {
  const copyAst = () => {
    if (ast) {
      navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
    }
  };

  return (
    <div className="h-11 bg-deep-slate flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs font-bold tracking-wider text-primary-foreground">
          WIREFRAME<span className="text-primary">DSL</span>
        </span>
        <div className="h-4 w-px bg-wire-stroke/30" />
        <span className="font-mono text-[10px] text-console-fg tracking-wide">UI-as-Code</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Mode toggle */}
        <div className="flex rounded-md overflow-hidden border border-wire-stroke/30">
          <button
            onClick={() => onModeChange("wireframe")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              mode === "wireframe"
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={() => onModeChange("ui")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              mode === "ui"
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            UI
          </button>
        </div>

        {/* Copy AST */}
        <button
          onClick={copyAst}
          disabled={!ast}
          className="px-3 py-1 text-xs font-mono text-console-fg border border-wire-stroke/30 rounded-md hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Copy JSON AST
        </button>

        {/* Templates */}
        <select
          onChange={(e) => {
            const t = TEMPLATES[e.target.value];
            if (t) onLoadTemplate(t);
            e.target.value = "";
          }}
          defaultValue=""
          className="px-3 py-1 text-xs font-mono bg-transparent text-console-fg border border-wire-stroke/30 rounded-md cursor-pointer"
        >
          <option value="" disabled>Templates</option>
          {Object.keys(TEMPLATES).map((name) => (
            <option key={name} value={name} className="bg-deep-slate">{name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GlobalToolbar;
