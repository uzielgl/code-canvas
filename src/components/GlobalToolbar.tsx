import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Save } from "lucide-react";
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
  currentTemplateName: string;
  templates: StoredTemplate[];
  onCurrentTemplateNameChange: (name: string) => void;
  onModeChange: (mode: "wireframe" | "ui") => void;
  onFormatChange: (format: DslFormat) => void;
  onSaveCurrentTemplate: () => void;
  onOpenTemplate: (template: StoredTemplate) => void;
  onOpenTemplateManager: () => void;
  ast: DslRoot | null;
  saveDisabled?: boolean;
}

const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  mode,
  format,
  currentTemplateName,
  templates,
  onCurrentTemplateNameChange,
  onModeChange,
  onFormatChange,
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
        <>
          <div className="h-4 w-px bg-wire-stroke/30" />
          <div className="flex items-center gap-2 min-w-0">
            <Input
              value={currentTemplateName}
              onChange={(event) => onCurrentTemplateNameChange(event.target.value)}
              className="h-8 w-[220px] bg-background text-xs"
              placeholder="Untitled template"
            />

            <Button size="sm" onClick={onSaveCurrentTemplate} disabled={saveDisabled}>
              <Save className="h-4 w-4" />
              Save
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    >
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
        Manage Templates
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
