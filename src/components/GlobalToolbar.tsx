import React from "react";
import { Link } from "react-router-dom";
import type { DslRoot } from "@/lib/dsl-schema";
import { DSL_FORMAT_LABELS, type DslFormat } from "@/lib/dsl-parser";
import AppHeader from "@/components/AppHeader";

interface GlobalToolbarProps {
  mode: "wireframe" | "ui";
  format: DslFormat;
  onModeChange: (mode: "wireframe" | "ui") => void;
  onFormatChange: (format: DslFormat) => void;
  onOpenTemplateManager: () => void;
  templateCount: number;
  ast: DslRoot | null;
}

const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  mode,
  format,
  onModeChange,
  onFormatChange,
  onOpenTemplateManager,
  templateCount,
  ast,
}) => {
  const copyAst = () => {
    if (ast) {
      navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
    }
  };

  return (
    <AppHeader>
      <div className="flex rounded-md overflow-hidden border border-wire-stroke/30">
        {(["yaml", "json"] as const).map((formatOption) => (
          <button
            key={formatOption}
            onClick={() => onFormatChange(formatOption)}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              format === formatOption
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            {DSL_FORMAT_LABELS[formatOption]}
          </button>
        ))}
      </div>

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

      <button
        onClick={onOpenTemplateManager}
        className="px-3 py-1 text-xs font-mono text-console-fg border border-wire-stroke/30 rounded-md hover:text-primary-foreground"
      >
        Templates ({templateCount})
      </button>

      <Link
        to="/examples"
        className="px-3 py-1 text-xs font-mono text-console-fg border border-wire-stroke/30 rounded-md hover:text-primary-foreground"
      >
        Browse Examples
      </Link>

      <button
        onClick={copyAst}
        disabled={!ast}
        className="px-3 py-1 text-xs font-mono text-console-fg border border-wire-stroke/30 rounded-md hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Copy JSON AST
      </button>
    </AppHeader>
  );
};

export default GlobalToolbar;
