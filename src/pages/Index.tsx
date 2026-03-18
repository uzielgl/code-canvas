import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { getBuiltInExampleById } from "@/lib/template-catalog";
import type { DslRoot, ValidationError } from "@/lib/dsl-schema";
import {
  type StoredTemplate,
  type TemplateMetadataInput,
  sortTemplatesByUpdatedAt,
} from "@/lib/template-store";

const Index: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dsl, setDsl] = useState(DEFAULT_DSL);
  const [format, setFormat] = useState<DslFormat>("yaml");
  const [mode, setMode] = useState<"wireframe" | "ui">("wireframe");
  const [ast, setAst] = useState<DslRoot | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [templates, setTemplates] = useState<StoredTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const lastValidAst = useRef<DslRoot | null>(null);
  const appliedDocumentRef = useRef<string | null>(null);

  const canSaveCurrent = errors.length === 0 && ast !== null;

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
      loadDocument(nextSource, nextFormat);
    }
  }, [loadDocument, searchParams, templates, templatesLoaded]);

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
    setSearchParams({ template: createdTemplate.id }, { replace: true });
    return createdTemplate;
  }, [canSaveCurrent, dsl, format, setSearchParams]);

  const handleUpdateTemplate = useCallback(async (templateId: string, input: TemplateMetadataInput) => {
    const updatedTemplate = await updateTemplateMetadata(templateId, input);
    setTemplates((currentTemplates) => sortTemplatesByUpdatedAt(currentTemplates.map((template) => (
      template.id === templateId ? updatedTemplate : template
    ))));
  }, []);

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
    ))));
  }, [canSaveCurrent, dsl, format]);

  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    await deleteTemplate(templateId);
    setTemplates((currentTemplates) => currentTemplates.filter((template) => template.id !== templateId));

    if (searchParams.get("template") === templateId) {
      setSearchParams({}, { replace: true });
      appliedDocumentRef.current = null;
    }
  }, [searchParams, setSearchParams]);

  const previewAst = useMemo(
    () => (errors.length > 0 ? lastValidAst.current : ast),
    [ast, errors.length],
  );

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <GlobalToolbar
          mode={mode}
          format={format}
          onModeChange={setMode}
          onFormatChange={handleFormatChange}
          onOpenTemplateManager={() => setIsTemplateManagerOpen(true)}
          templateCount={templates.length}
          ast={ast}
        />
        <div className="flex flex-1 min-h-0">
          <div className="w-1/2 flex flex-col border-r border-border min-h-0">
            <div className="flex-1 min-h-0">
              <DslEditor value={dsl} onChange={setDsl} format={format} />
            </div>
            <ValidationConsole errors={errors} />
          </div>
          <div className="w-1/2 min-h-0">
            <LiveCanvas ast={previewAst} mode={mode} errors={errors} />
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
