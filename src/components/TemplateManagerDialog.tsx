import React, { useEffect, useMemo, useState } from "react";
import { FolderOpen, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DSL_FORMAT_LABELS, type DslFormat } from "@/lib/dsl-parser";
import {
  normalizeTags,
  type StoredTemplate,
  type TemplateMetadataInput,
} from "@/lib/template-store";

interface TemplateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: StoredTemplate[];
  currentFormat: DslFormat;
  canSaveCurrent: boolean;
  onLoadTemplate: (template: StoredTemplate) => void;
  onCreateTemplate: (input: TemplateMetadataInput) => Promise<StoredTemplate | null>;
  onUpdateTemplate: (templateId: string, input: TemplateMetadataInput) => Promise<void>;
  onOverwriteTemplate: (templateId: string, input: TemplateMetadataInput) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
}

interface TemplateFormState {
  name: string;
  description: string;
  category: string;
  tags: string;
  includeInExamples: boolean;
}

const emptyFormState: TemplateFormState = {
  name: "",
  description: "",
  category: "Custom",
  tags: "",
  includeInExamples: false,
};

function toFormState(template: StoredTemplate): TemplateFormState {
  return {
    name: template.name,
    description: template.description,
    category: template.category,
    tags: template.tags.join(", "),
    includeInExamples: template.includeInExamples,
  };
}

const TemplateManagerDialog: React.FC<TemplateManagerDialogProps> = ({
  open,
  onOpenChange,
  templates,
  currentFormat,
  canSaveCurrent,
  onLoadTemplate,
  onCreateTemplate,
  onUpdateTemplate,
  onOverwriteTemplate,
  onDeleteTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TemplateFormState>(emptyFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedTemplate) {
      setFormState(toFormState(selectedTemplate));
      return;
    }

    setFormState(emptyFormState);
  }, [open, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplateId && !selectedTemplate) {
      setSelectedTemplateId(null);
    }
  }, [selectedTemplateId, selectedTemplate]);

  const metadataInput: TemplateMetadataInput = {
    name: formState.name.trim(),
    description: formState.description.trim(),
    category: formState.category.trim(),
    tags: normalizeTags(formState.tags),
    includeInExamples: formState.includeInExamples,
  };

  const hasValidName = metadataInput.name.length > 0;

  const handleCreate = async () => {
    if (!canSaveCurrent || !hasValidName) {
      return;
    }

    try {
      setIsSubmitting(true);
      const createdTemplate = await onCreateTemplate(metadataInput);
      if (!createdTemplate) {
        return;
      }

      setSelectedTemplateId(createdTemplate.id);
    } catch (error) {
      console.error("Failed to create template", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!selectedTemplate || !hasValidName) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateTemplate(selectedTemplate.id, metadataInput);
    } catch (error) {
      console.error("Failed to update template metadata", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverwrite = async () => {
    if (!selectedTemplate || !canSaveCurrent || !hasValidName) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onOverwriteTemplate(selectedTemplate.id, metadataInput);
    } catch (error) {
      console.error("Failed to overwrite template", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteTemplate(selectedTemplate.id);
      setSelectedTemplateId(null);
    } catch (error) {
      console.error("Failed to delete template", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[86vh] overflow-hidden p-0 gap-0">
        <div className="flex h-full min-h-0">
          <div className="w-[320px] border-r border-border bg-surface/70 flex flex-col min-h-0">
            <DialogHeader className="px-6 py-5 border-b border-border">
              <DialogTitle>Template Manager</DialogTitle>
              <DialogDescription>
                Guarda templates persistentes en servidor en {DSL_FORMAT_LABELS[currentFormat]} y publícalos en la página de ejemplos.
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 border-b border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setSelectedTemplateId(null)}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                New template
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {templates.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No hay templates guardados todavía.
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full text-left rounded-lg border px-3 py-3 transition-colors disabled:opacity-70",
                      selectedTemplateId === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-background",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-sm text-foreground truncate">{template.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {DSL_FORMAT_LABELS[template.format]}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{template.category}</div>
                    {template.includeInExamples && (
                      <div className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Visible en examples
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="max-w-3xl p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedTemplate ? "Edit template" : "Create template from current editor"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  El contenido se guarda en disco desde el editor actual. Si el DSL tiene errores, no se puede crear ni sobrescribir.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="template-name">
                    Name
                  </label>
                  <Input
                    id="template-name"
                    value={formState.name}
                    onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Customer dashboard"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="template-category">
                    Category
                  </label>
                  <Input
                    id="template-category"
                    value={formState.category}
                    onChange={(event) => setFormState((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Custom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="template-description">
                  Description
                </label>
                <Textarea
                  id="template-description"
                  rows={3}
                  value={formState.description}
                  onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Internal CRM layout with table, filters, and a details panel."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="template-tags">
                  Tags
                </label>
                <Input
                  id="template-tags"
                  value={formState.tags}
                  onChange={(event) => setFormState((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="crm, dashboard, table"
                />
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <input
                  type="checkbox"
                  checked={formState.includeInExamples}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, includeInExamples: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Show on /examples</div>
                  <div className="text-xs text-muted-foreground">
                    Publica este template del usuario en el catálogo de ejemplos.
                  </div>
                </div>
              </label>

              <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Editor format</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{DSL_FORMAT_LABELS[currentFormat]}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Current editor</div>
                  <div className={cn("mt-1 text-sm font-medium", canSaveCurrent ? "text-foreground" : "text-destructive")}>
                    {canSaveCurrent ? "Valid and ready to save" : "Has validation errors"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Selected template</div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {selectedTemplate ? DSL_FORMAT_LABELS[selectedTemplate.format] : "New template"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!selectedTemplate ? (
                  <Button type="button" onClick={handleCreate} disabled={!canSaveCurrent || !hasValidName || isSubmitting}>
                    <Save className="h-4 w-4" />
                    Create from current editor
                  </Button>
                ) : (
                  <>
                    <Button type="button" onClick={handleUpdateMetadata} disabled={!hasValidName || isSubmitting}>
                      <PencilLine className="h-4 w-4" />
                      Update metadata
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOverwrite}
                      disabled={!canSaveCurrent || !hasValidName || isSubmitting}
                    >
                      <Save className="h-4 w-4" />
                      Overwrite with current editor
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onLoadTemplate(selectedTemplate)}
                      disabled={isSubmitting}
                    >
                      <FolderOpen className="h-4 w-4" />
                      Load into editor
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagerDialog;
