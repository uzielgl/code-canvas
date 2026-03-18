import React from "react";
import { ChevronDown, Columns2, Copy, FilePlus2, PanelRightOpen, Save } from "lucide-react";
import type { DslRoot } from "@/lib/dsl-schema";
import { DSL_FORMAT_LABELS, type DslFormat } from "@/lib/dsl-parser";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { StoredTemplate } from "@/lib/template-store";

interface GlobalToolbarProps {
  mode: "wireframe" | "ui";
  format: DslFormat;
  canvasLayout: "split" | "preview";
  currentTemplateName: string;
  templates: StoredTemplate[];
  onCurrentTemplateNameChange: (name: string) => void;
  onModeChange: (mode: "wireframe" | "ui") => void;
  onFormatChange: (format: DslFormat) => void;
  onCanvasLayoutChange: (layout: "split" | "preview") => void;
  onNewTemplate: () => void;
  onSaveCurrentTemplate: () => void;
  onOpenTemplate: (template: StoredTemplate) => void;
  onOpenTemplateManager: () => void;
  ast: DslRoot | null;
  saveDisabled?: boolean;
}

const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  mode,
  format,
  canvasLayout,
  currentTemplateName,
  templates,
  onCurrentTemplateNameChange,
  onModeChange,
  onFormatChange,
  onCanvasLayoutChange,
  onNewTemplate,
  onSaveCurrentTemplate,
  onOpenTemplate,
  onOpenTemplateManager,
  ast,
  saveDisabled = false,
}) => {
  const copyAst = () => {
    if (ast) {
      navigator.clipboard.writeText(JSON.stringify(ast, null, 2));
    }
  };

  return (
    <AppHeader
      leftChildren={(
        <div className="flex items-center gap-2 min-w-0">
          <Input
            value={currentTemplateName}
            onChange={(event) => onCurrentTemplateNameChange(event.target.value)}
            className="h-8 w-[210px] bg-background text-xs"
            placeholder="Untitled template"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={onNewTemplate}
            disabled={saveDisabled}
            title="New Template"
            aria-label="New Template"
          >
            <FilePlus2 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={onSaveCurrentTemplate}
            disabled={saveDisabled}
            title="Save Template"
            aria-label="Save Template"
          >
            <Save className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Open
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>Templates</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {templates.length === 0 ? (
                <DropdownMenuItem disabled>No saved templates</DropdownMenuItem>
              ) : (
                templates.map((template) => (
                  <DropdownMenuItem key={template.id} onClick={() => onOpenTemplate(template)}>
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="truncate">{template.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {DSL_FORMAT_LABELS[template.format]}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenTemplateManager}>
                Manage Templates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      centerChildren={(
        <nav className="flex items-center gap-1 shrink-0">
          <Button asChild size="sm" variant="ghost" className="text-xs font-mono text-console-fg hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
            <a href="/">Editor</a>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-xs font-mono text-console-fg hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
            <a href="/examples">Examples</a>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-xs font-mono text-console-fg hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
            <a href="/docs">Docs</a>
          </Button>
        </nav>
      )}
    >
      <div className="flex rounded-md overflow-hidden border border-wire-stroke/30 shrink-0">
        {(["yaml", "json"] as const).map((formatOption) => (
          <button
            key={formatOption}
            onClick={() => onFormatChange(formatOption)}
            className={`px-2.5 py-1 text-xs font-mono transition-colors ${
              format === formatOption
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            {DSL_FORMAT_LABELS[formatOption]}
          </button>
        ))}
      </div>

      <div className="flex rounded-md overflow-hidden border border-wire-stroke/30 shrink-0">
        <button
          onClick={() => onModeChange("wireframe")}
          className={`px-2.5 py-1 text-xs font-mono transition-colors ${
            mode === "wireframe"
              ? "bg-primary text-primary-foreground"
              : "text-console-fg hover:text-primary-foreground"
          }`}
        >
          Wireframe
        </button>
        <button
          onClick={() => onModeChange("ui")}
          className={`px-2.5 py-1 text-xs font-mono transition-colors ${
            mode === "ui"
              ? "bg-primary text-primary-foreground"
              : "text-console-fg hover:text-primary-foreground"
          }`}
        >
          UI
        </button>
      </div>

      <div className="flex rounded-md overflow-hidden border border-wire-stroke/30 shrink-0">
        <button
          onClick={() => onCanvasLayoutChange("split")}
          className={`px-2.5 py-1 text-xs font-mono transition-colors ${
            canvasLayout === "split"
              ? "bg-primary text-primary-foreground"
              : "text-console-fg hover:text-primary-foreground"
          }`}
          title="Split Layout"
        >
          <span className="inline-flex items-center gap-2">
            <Columns2 className="h-3.5 w-3.5" />
            Split
          </span>
        </button>
        <button
          onClick={() => onCanvasLayoutChange("preview")}
          className={`px-2.5 py-1 text-xs font-mono transition-colors ${
            canvasLayout === "preview"
              ? "bg-primary text-primary-foreground"
              : "text-console-fg hover:text-primary-foreground"
          }`}
          title="Full Preview"
        >
          <span className="inline-flex items-center gap-2">
            <PanelRightOpen className="h-3.5 w-3.5" />
            Preview
          </span>
        </button>
      </div>

      <button
        onClick={copyAst}
        disabled={!ast}
        title="Copy JSON AST"
        aria-label="Copy JSON AST"
        className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-mono text-console-fg border border-wire-stroke/30 rounded-md hover:text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </AppHeader>
  );
};

export default GlobalToolbar;
