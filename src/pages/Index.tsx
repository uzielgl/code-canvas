import React, { useState, useCallback, useRef, useEffect } from "react";
import DslEditor from "@/components/DslEditor";
import LiveCanvas from "@/components/LiveCanvas";
import ValidationConsole from "@/components/ValidationConsole";
import GlobalToolbar from "@/components/GlobalToolbar";
import { parseDsl } from "@/lib/dsl-parser";
import { DEFAULT_DSL } from "@/lib/default-template";
import type { DslRoot, ValidationError } from "@/lib/dsl-schema";

const Index: React.FC = () => {
  const [dsl, setDsl] = useState(DEFAULT_DSL);
  const [mode, setMode] = useState<"wireframe" | "ui">("wireframe");
  const [ast, setAst] = useState<DslRoot | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const lastValidAst = useRef<DslRoot | null>(null);

  const handleParse = useCallback((source: string) => {
    const result = parseDsl(source);
    setErrors(result.errors);
    if (result.ast) {
      lastValidAst.current = result.ast;
      setAst(result.ast);
    }
    // Keep last valid AST on screen if errors
  }, []);

  useEffect(() => {
    handleParse(dsl);
  }, [dsl, handleParse]);

  const handleLoadTemplate = (template: string) => {
    setDsl(template);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <GlobalToolbar
        mode={mode}
        onModeChange={setMode}
        onLoadTemplate={handleLoadTemplate}
        ast={ast}
      />
      <div className="flex flex-1 min-h-0">
        {/* Left pane: editor + console */}
        <div className="w-1/2 flex flex-col border-r border-border min-h-0">
          <div className="flex-1 min-h-0">
            <DslEditor value={dsl} onChange={setDsl} />
          </div>
          <ValidationConsole errors={errors} />
        </div>
        {/* Right pane: live canvas */}
        <div className="w-1/2 min-h-0">
          <LiveCanvas ast={errors.length > 0 ? lastValidAst.current : ast} mode={mode} errors={errors} />
        </div>
      </div>
    </div>
  );
};

export default Index;
