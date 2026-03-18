import React from "react";
import type { ValidationError } from "@/lib/dsl-schema";

interface ValidationConsoleProps {
  errors: ValidationError[];
}

const ValidationConsole: React.FC<ValidationConsoleProps> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <div className="bg-console-bg text-console-fg px-4 py-2 font-mono text-xs flex items-center gap-2 border-t border-border">
        <span className="text-green-400">✓</span> Valid DSL — no errors
      </div>
    );
  }

  return (
    <div className="bg-console-bg text-console-fg px-4 py-2 font-mono text-xs border-t border-border max-h-32 overflow-y-auto space-y-1 validation-fade-in">
      <div className="flex items-center gap-2 text-destructive font-semibold mb-1">
        <span>✕</span> {errors.length} error{errors.length > 1 ? "s" : ""}
      </div>
      {errors.map((err, i) => (
        <div key={i} className="text-destructive/80">
          {err.line != null && <span className="text-muted-foreground mr-2">Ln {err.line}</span>}
          {err.message}
        </div>
      ))}
    </div>
  );
};

export default ValidationConsole;
