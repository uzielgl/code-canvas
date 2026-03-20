import React from "react";
import { Copy, Settings2, X } from "lucide-react";
import type { DslRoot } from "@/lib/dsl-schema";
import { DSL_FORMAT_LABELS, type DslFormat } from "@/lib/dsl-parser";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorSettingsDockProps {
  ast: DslRoot | null;
  format: DslFormat;
  wordWrapEnabled: boolean;
  isOpen: boolean;
  className?: string;
  onAiClick: () => void;
  onOpenChange: (open: boolean) => void;
  onFormatChange: (format: DslFormat) => void;
  onWordWrapChange: (enabled: boolean) => void;
}

const optionBaseClassName = "flex h-10 items-center justify-center rounded-xl border px-3 text-xs font-mono transition-colors";
const optionIdleClassName = "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground";
const optionActiveClassName = "border-primary bg-primary text-primary-foreground shadow-sm";

interface SettingsOptionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

const SettingsOptionButton: React.FC<SettingsOptionButtonProps> = ({
  active,
  className,
  children,
  ...props
}) => (
  <button
    type="button"
    className={cn(
      optionBaseClassName,
      active ? optionActiveClassName : optionIdleClassName,
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const SettingsGroup: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="space-y-2">
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </div>
    {children}
  </div>
);

const EditorSettingsDock: React.FC<EditorSettingsDockProps> = ({
  ast,
  format,
  wordWrapEnabled,
  isOpen,
  className,
  onAiClick,
  onOpenChange,
  onFormatChange,
  onWordWrapChange,
}) => {
  const handleCopyAst = () => {
    if (!ast) {
      return;
    }

    void navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
  };

  const settingsPanel = (
    <div className="w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/80 bg-background/95 p-4 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Editor options</h3>
          <p className="text-xs text-muted-foreground">
            Keep source controls tucked away until you need them.
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => onOpenChange(false)}
          aria-label="Close editor settings"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <SettingsGroup label="Format">
          <div className="grid grid-cols-2 gap-2">
            <SettingsOptionButton active={format === "yaml"} onClick={() => onFormatChange("yaml")}>
              {DSL_FORMAT_LABELS.yaml}
            </SettingsOptionButton>
            <SettingsOptionButton active={format === "json"} onClick={() => onFormatChange("json")}>
              {DSL_FORMAT_LABELS.json}
            </SettingsOptionButton>
          </div>
        </SettingsGroup>

        <SettingsGroup label="Wrap">
          <div className="grid grid-cols-2 gap-2">
            <SettingsOptionButton active={wordWrapEnabled} onClick={() => onWordWrapChange(true)}>
              Wrap
            </SettingsOptionButton>
            <SettingsOptionButton active={!wordWrapEnabled} onClick={() => onWordWrapChange(false)}>
              No wrap
            </SettingsOptionButton>
          </div>
        </SettingsGroup>

        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-center rounded-xl text-xs font-mono"
          onClick={handleCopyAst}
          disabled={!ast}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy AST
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("relative border-t border-border bg-gradient-to-r from-slate-950 via-deep-slate to-slate-950 px-2 py-1.5", className)}>
      {isOpen ? (
        <div className="absolute bottom-full right-2 z-20 mb-2">
          {settingsPanel}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-full px-3 text-xs font-mono"
          onClick={onAiClick}
        >
          AI
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 rounded-full px-3 text-xs font-mono text-console-fg hover:bg-white/10 hover:text-primary-foreground"
          onClick={() => onOpenChange(!isOpen)}
        >
          <Settings2 className="h-4 w-4" />
          {isOpen ? "Close" : "Options"}
        </Button>
      </div>
    </div>
  );
};

export default EditorSettingsDock;
