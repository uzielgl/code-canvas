import React from "react";
import type { DslNode, DslRoot } from "@/lib/dsl-schema";
import type { ValidationError } from "@/lib/dsl-schema";
import NodeRenderer from "./DslRenderer";

interface LiveCanvasProps {
  ast: DslRoot | null;
  mode: "wireframe" | "ui";
  errors: ValidationError[];
  onActivateLink?: (reference: string) => void;
  resolveTemplate?: (reference: string) => DslNode | null;
}

const LiveCanvas: React.FC<LiveCanvasProps> = ({ ast, mode, errors, onActivateLink, resolveTemplate }) => {
  const isWire = mode === "wireframe";

  return (
    <div className={`h-full overflow-auto p-6 relative ${isWire ? "dot-grid-bg bg-wire-bg" : "bg-surface"}`}>
      {ast ? (
        <NodeRenderer
          node={ast.root}
          mode={mode}
          onActivateLink={onActivateLink}
          resolveTemplate={resolveTemplate}
          templateStack={[]}
        />
      ) : errors.length > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 validation-fade-in">
          <div className="text-center space-y-2">
            <div className="text-destructive font-mono text-sm font-semibold">Parse Error</div>
            <div className="text-muted-foreground font-mono text-xs max-w-md">
              Fix the errors in the editor to see the preview.
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground font-mono text-xs">Write YAML DSL to see preview</div>
        </div>
      )}
    </div>
  );
};

export default LiveCanvas;
