import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import DslEditor from "@/components/DslEditor";
import LiveCanvas from "@/components/LiveCanvas";
import ValidationConsole from "@/components/ValidationConsole";
import GlobalToolbar from "@/components/GlobalToolbar";
import TemplateManagerDialog from "@/components/TemplateManagerDialog";
import { DEFAULT_DSL } from "@/lib/default-template";
import { parseDsl, serializeDsl, type DslFormat } from "@/lib/dsl-parser";
import {
  createTemplate,
  deleteTemplate,
  fetchTemplates,
  overwriteTemplate,
  updateTemplateMetadata,
} from "@/lib/template-api";
import { BUILT_IN_EXAMPLES, getBuiltInExampleById } from "@/lib/template-catalog";
import type { DslRoot, ValidationError } from "@/lib/dsl-schema";
import {
  slugifyTemplateName,
  type StoredTemplate,
  type TemplateMetadataInput,
  sortTemplatesByUpdatedAt,
} from "@/lib/template-store";

const Index: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dsl, setDsl] = useState(DEFAULT_DSL);
  const [format, setFormat] = useState<DslFormat>("yaml");
  const [mode, setMode] = useState<"wireframe" | "ui">("ui");
  const [canvasLayout, setCanvasLayout] = useState<"split" | "preview">("split");
  const [ast, setAst] = useState<DslRoot | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [currentTemplateName, setCurrentTemplateName] = useState("Workspace Starter");
  const lastValidAst = useRef<DslRoot | null>(null);
  const appliedDocumentRef = useRef<string | null>(null);

  const canSaveCurrent = errors.length === 0 && ast !== null;
  const currentTemplateId = searchParams.get("template");
  const currentTemplate = currentTemplateId
    ? templates.find((template) => template.id === currentTemplateId) ?? null
    : null;

  const handleParse = useCallback((source: string, sourceFormat: DslFormat) => {
    const result = parseDsl(source, sourceFormat);
    setErrors(result.errors);
    if (result.ast) {
      lastValidAst.current = result.ast;
      setAst(result.ast);
    }
  }, []);

  useEffect(() => {
    handleParse(dsl, format);
  }, [dsl, format, handleParse]);

  useEffect(() => {
    let active = true;

    const loadTemplates = async () => {
      try {
        const storedTemplates = await fetchTemplates();
        if (active) {
          setTemplates(storedTemplates);
        }
      } catch (error) {
        console.error("Failed to load templates", error);
      } finally {
        if (active) {
          setTemplatesLoaded(true);
        }
      }
    };

    void loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  const loadDocument = useCallback((source: string, sourceFormat: DslFormat) => {
    setFormat(sourceFormat);
    setDsl(source);
  }, []);

  useEffect(() => {
    const exampleId = searchParams.get("example");
    const templateId = searchParams.get("template");

    if (!exampleId && !templateId) {
      appliedDocumentRef.current = null;
      return;
    }

    if (exampleId) {
      const requestedFormat: DslFormat = searchParams.get("format") === "json" ? "json" : "yaml";
      const key = `example:${exampleId}:${requestedFormat}`;
      if (appliedDocumentRef.current === key) {
        return;
      }

      const example = getBuiltInExampleById(exampleId);
      if (!example) {
        return;
      }

      appliedDocumentRef.current = key;
      setCurrentTemplateName(example.name);
      loadDocument(serializeDsl(example.document, requestedFormat), requestedFormat);
      return;
    }

    if (templateId) {
      if (!templatesLoaded) {
        return;
      }

      const requestedFormat = searchParams.get("format") === "json"
        ? "json"
        : searchParams.get("format") === "yaml"
          ? "yaml"
          : null;
      const key = `template:${templateId}:${requestedFormat ?? "stored"}`;
      if (appliedDocumentRef.current === key) {
        return;
      }

      const storedTemplate = templates.find((template) => template.id === templateId);

      if (!storedTemplate) {
        return;
      }

      let nextSource = storedTemplate.source;
      let nextFormat = storedTemplate.format;

      if (requestedFormat && requestedFormat !== storedTemplate.format) {
        const parsedTemplate = parseDsl(storedTemplate.source, storedTemplate.format);
        if (parsedTemplate.ast) {
          nextSource = serializeDsl(parsedTemplate.ast, requestedFormat);
          nextFormat = requestedFormat;
        }
      }

      appliedDocumentRef.current = key;
      setCurrentTemplateName(storedTemplate.name);
      loadDocument(nextSource, nextFormat);
    }
  }, [loadDocument, searchParams, templates, templatesLoaded]);

  useEffect(() => {
    if (currentTemplate) {
      setCurrentTemplateName(currentTemplate.name);
    }
  }, [currentTemplate]);

  const handleFormatChange = useCallback((nextFormat: DslFormat) => {
    if (nextFormat === format) {
      return;
    }

    const candidateAst = ast ?? lastValidAst.current;
    if (candidateAst) {
      setDsl(serializeDsl(candidateAst, nextFormat));
    }

    setFormat(nextFormat);

    if (searchParams.get("example")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("format", nextFormat);
      setSearchParams(nextParams, { replace: true });
    }
  }, [ast, format, searchParams, setSearchParams]);

  const handleLoadTemplate = useCallback((template: StoredTemplate) => {
    appliedDocumentRef.current = `template:${template.id}`;
    setSearchParams({ template: template.id }, { replace: true });
    setCurrentTemplateName(template.name);
    loadDocument(template.source, template.format);
    setIsTemplateManagerOpen(false);
  }, [loadDocument, setSearchParams]);

  const handleCreateTemplate = useCallback(async (input: TemplateMetadataInput) => {
    if (!canSaveCurrent) {
      return null;
    }

    const createdTemplate = await createTemplate({
      ...input,
      format,
      source: dsl,
    });

    setTemplates((currentTemplates) => sortTemplatesByUpdatedAt([
      createdTemplate,
      ...currentTemplates.filter((template) => template.id !== createdTemplate.id),
    ]));
    appliedDocumentRef.current = `template:${createdTemplate.id}`;
    setCurrentTemplateName(createdTemplate.name);
    setSearchParams({ template: createdTemplate.id }, { replace: true });
    toast.success(`Saved "${createdTemplate.name}"`);
    return createdTemplate;
  }, [canSaveCurrent, dsl, format, setSearchParams]);

  const handleUpdateTemplate = useCallback(async (templateId: string, input: TemplateMetadataInput) => {
    const updatedTemplate = await updateTemplateMetadata(templateId, input);
    setTemplates((currentTemplates) => sortTemplatesByUpdatedAt(currentTemplates.map((template) => (
      template.id === templateId ? updatedTemplate : template
    )).filter((template, index, allTemplates) => (
      allTemplates.findIndex((candidate) => candidate.id === template.id) === index
    ))));
    setCurrentTemplateName(updatedTemplate.name);
    if (templateId !== updatedTemplate.id || currentTemplateId === templateId) {
      setSearchParams({ template: updatedTemplate.id }, { replace: true });
      appliedDocumentRef.current = `template:${updatedTemplate.id}`;
    }
    toast.success(`Updated "${updatedTemplate.name}"`);
  }, [currentTemplateId, setSearchParams]);

  const handleOverwriteTemplate = useCallback(async (templateId: string, input: TemplateMetadataInput) => {
    if (!canSaveCurrent) {
      return;
    }

    const updatedTemplate = await overwriteTemplate(templateId, {
      ...input,
      format,
      source: dsl,
    });
    setTemplates((currentTemplates) => sortTemplatesByUpdatedAt(currentTemplates.map((template) => (
      template.id === templateId ? updatedTemplate : template
    )).filter((template, index, allTemplates) => (
      allTemplates.findIndex((candidate) => candidate.id === template.id) === index
    ))));
    setCurrentTemplateName(updatedTemplate.name);
    if (templateId !== updatedTemplate.id || currentTemplateId === templateId) {
      setSearchParams({ template: updatedTemplate.id }, { replace: true });
      appliedDocumentRef.current = `template:${updatedTemplate.id}`;
    }
    toast.success(`Saved "${updatedTemplate.name}"`);
  }, [canSaveCurrent, currentTemplateId, dsl, format, setSearchParams]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    await deleteTemplate(templateId);
    setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));

    if (searchParams.get("template") === templateId) {
      setSearchParams({}, { replace: true });
      appliedDocumentRef.current = null;
    }
    toast.success("Template deleted");
  }, [searchParams, setSearchParams]);

  const handleSaveCurrentTemplate = useCallback(async () => {
    if (!canSaveCurrent) {
      toast.error("Fix validation errors before saving");
      return;
    }

    const nextName = currentTemplateName.trim();
    if (!nextName) {
      toast.error("Template name is required");
      return;
    }

    const duplicateTemplate = templates.find((template) => template.id === slugifyTemplateName(nextName));
    if (duplicateTemplate && duplicateTemplate.id !== currentTemplate?.id) {
      toast.error(`A template named "${duplicateTemplate.name}" already exists`);
      return;
    }

    const baseInput: TemplateMetadataInput = {
      name: nextName,
      description: currentTemplate?.description ?? "",
      category: currentTemplate?.category ?? "Custom",
      tags: currentTemplate?.tags ?? [],
      includeInExamples: currentTemplate?.includeInExamples ?? false,
    };

    try {
      if (currentTemplate) {
        await handleOverwriteTemplate(currentTemplate.id, baseInput);
      } else {
        await handleCreateTemplate(baseInput);
      }
    } catch (error) {
      console.error("Failed to save current template", error);
      toast.error(error instanceof Error ? error.message : "Failed to save template");
    }
  }, [canSaveCurrent, currentTemplate, currentTemplateName, handleCreateTemplate, handleOverwriteTemplate, templates]);

  const handleOpenTemplateByReference = useCallback((reference: string) => {
    const normalizedReference = reference.trim().toLowerCase();
    const matchedTemplate = templates.find((template) => (
      template.name.trim().toLowerCase() === normalizedReference
      || template.id === slugifyTemplateName(reference)
    ));

    if (!matchedTemplate) {
      toast.error(`Template "${reference}" was not found`);
      return;
    }

    handleLoadTemplate(matchedTemplate);
  }, [handleLoadTemplate, templates]);

  const handleNewTemplate = useCallback(() => {
    appliedDocumentRef.current = null;
    setSearchParams({}, { replace: true });
    setCurrentTemplateName("Untitled Template");
    setFormat("yaml");
    setDsl(DEFAULT_DSL);
    toast.success("Started a new template");
  }, [setSearchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s";
      if (!isSaveShortcut) {
        return;
      }

      event.preventDefault();
      void handleSaveCurrentTemplate();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveCurrentTemplate]);

  const previewAst = useMemo(
    () => (errors.length > 0 ? lastValidAst.current : ast),
    [ast, errors.length],
  );

  const parsedTemplateRoots = useMemo(() => {
    const rootsByTemplateId = new Map<string, DslRoot>();
    templates.forEach((template) => {
      const parsed = parseDsl(template.source, template.format);
      if (parsed.ast) {
        rootsByTemplateId.set(template.id, parsed.ast);
      }
    });
    return rootsByTemplateId;
  }, [templates]);

  const resolveTemplateNode = useCallback((reference: string) => {
    const normalized = reference.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    const matchedStored = templates.find((template) => (
      template.name.trim().toLowerCase() === normalized
      || template.id === slugifyTemplateName(reference)
    ));

    if (matchedStored) {
      const parsed = parsedTemplateRoots.get(matchedStored.id);
      return parsed?.root ?? null;
    }

    const matchedBuiltIn = BUILT_IN_EXAMPLES.find((example) => (
      example.name.trim().toLowerCase() === normalized
      || example.id === normalized
    ));

    return matchedBuiltIn?.document.root ?? null;
  }, [parsedTemplateRoots, templates]);

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <GlobalToolbar
          mode={mode}
          format={format}
          canvasLayout={canvasLayout}
          currentTemplateName={currentTemplateName}
          templates={templates}
          onCurrentTemplateNameChange={setCurrentTemplateName}
          onModeChange={setMode}
          onFormatChange={handleFormatChange}
          onCanvasLayoutChange={setCanvasLayout}
          onNewTemplate={handleNewTemplate}
          onSaveCurrentTemplate={() => { void handleSaveCurrentTemplate(); }}
          onOpenTemplate={handleLoadTemplate}
          onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
          ast={ast}
          saveDisabled={!templatesLoaded}
        />
        <div className="flex flex-1 min-h-0">
          {canvasLayout === "split" && (
            <div className="w-1/2 flex flex-col border-r border-border min-h-0">
              <div className="flex-1 min-h-0">
                <DslEditor value={dsl} onChange={setDsl} format={format} />
              </div>
              <ValidationConsole errors={errors} />
            </div>
          )}
          <div className={`${canvasLayout === "split" ? "w-1/2" : "w-full"} min-h-0`}>
            <LiveCanvas
              ast={previewAst}
              mode={mode}
              errors={errors}
              onActivateLink={handleOpenTemplateByReference}
              resolveTemplate={resolveTemplateNode}
            />
          </div>
        </div>
      </div>

      <TemplateManagerDialog
        open={isTemplateManagerOpen}
        onOpenChange={setIsTemplateManagerOpen}
        templates={templates}
        currentFormat={format}
        canSaveCurrent={canSaveCurrent}
        onLoadTemplate={handleLoadTemplate}
        onCreateTemplate={handleCreateTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        onOverwriteTemplate={handleOverwriteTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
    </>
  );
};

export default Index;
