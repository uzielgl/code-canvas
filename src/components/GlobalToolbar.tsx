import React from "react";
import { ChevronDown, Columns2, FilePlus2, PanelRightOpen, Save } from "lucide-react";
import { DSL_FORMAT_LABELS } from "@/lib/dsl-parser";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { StoredTemplate } from "@/lib/template-store";

interface GlobalToolbarProps {
  mode: "wireframe" | "ui";
  canvasLayout: "split" | "preview";
  currentTemplateName: string;
  templates: StoredTemplate[];
  onCurrentTemplateNameChange: (name: string) => void;
  onModeChange: (mode: "wireframe" | "ui") => void;
  onCanvasLayoutChange: (layout: "split" | "preview") => void;
  onNewTemplate: () => void;
  onSaveCurrentTemplate: () => void;
  onOpenTemplate: (template: StoredTemplate) => void;
  onOpenTemplateManager: () => void;
  saveDisabled?: boolean;
}

const GlobalToolbar: React.FC<GlobalToolbarProps> = ({
  mode,
  canvasLayout,
  currentTemplateName,
  templates,
  onCurrentTemplateNameChange,
  onModeChange,
  onCanvasLayoutChange,
  onNewTemplate,
  onSaveCurrentTemplate,
  onOpenTemplate,
  onOpenTemplateManager,
  saveDisabled = false,
}) => {
  const [templateQuery, setTemplateQuery] = React.useState("");

  const filteredTemplates = React.useMemo(() => {
    const normalizedQuery = templateQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return templates;
    }

    return templates.filter((template) => {
      const searchableText = [
        template.name,
        template.id,
        template.description,
        template.category,
        ...template.tags,
      ].join(" ").toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [templateQuery, templates]);

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

          <DropdownMenu onOpenChange={(open) => {
            if (!open) {
              setTemplateQuery("");
            }
          }}
          >
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Open
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0">
              <div className="flex max-h-[min(28rem,var(--radix-dropdown-menu-content-available-height))] flex-col">
                <div className="border-b px-3 py-3">
                  <DropdownMenuLabel className="px-0 py-0">Templates</DropdownMenuLabel>
                  <div className="mt-2" onKeyDown={(event) => event.stopPropagation()}>
                    <Input
                      value={templateQuery}
                      onChange={(event) => setTemplateQuery(event.target.value)}
                      className="h-8 bg-background text-xs"
                      placeholder="Search templates..."
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-1">
                  {filteredTemplates.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      {templates.length === 0 ? "No saved templates" : "No templates found"}
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
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
                </div>

                <div className="border-t bg-popover p-1">
                  <DropdownMenuItem onClick={onOpenTemplateManager} className="font-medium">
                    Manage Templates
                  </DropdownMenuItem>
                </div>
              </div>
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
        <button
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
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
    </AppHeader>
  );
};

export default GlobalToolbar;
