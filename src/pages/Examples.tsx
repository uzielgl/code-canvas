import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import NodeRenderer from "@/components/DslRenderer";
import { Button } from "@/components/ui/button";
import { parseDsl, type DslFormat } from "@/lib/dsl-parser";
import { fetchTemplates } from "@/lib/template-api";
import { BUILT_IN_EXAMPLES, collectComponentTypes } from "@/lib/template-catalog";
import { SUPPORTED_COMPONENT_TYPES, type ComponentType, type DslRoot } from "@/lib/dsl-schema";
import type { StoredTemplate } from "@/lib/template-store";

type PreviewMode = "wireframe" | "ui";

interface ExampleCatalogEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  components: ComponentType[];
  document: DslRoot;
  kind: "builtin" | "user";
}

const CATEGORY_ORDER = ["Index", "Starters", "Forms", "Layouts", "Advanced", "Compositions", "Custom"];

function getEditorHref(entry: ExampleCatalogEntry, format: DslFormat): string {
  if (entry.kind === "builtin") {
    return `/?example=${entry.id}&format=${format}`;
  }

  return `/?template=${entry.id}&format=${format}`;
}

const ExamplesPage: React.FC = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("wireframe");
  const [publishedTemplates, setPublishedTemplates] = useState<StoredTemplate[]>([]);

  useEffect(() => {
    let active = true;

    const loadTemplates = async () => {
      try {
        const templates = await fetchTemplates();
        if (active) {
          setPublishedTemplates(templates.filter((template) => template.includeInExamples));
        }
      } catch (error) {
        console.error("Failed to load published templates", error);
      }
    };

    void loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  const catalogEntries = useMemo<ExampleCatalogEntry[]>(() => {
    const builtInEntries: ExampleCatalogEntry[] = BUILT_IN_EXAMPLES.map((example) => ({
      id: example.id,
      name: example.name,
      description: example.description,
      category: example.category,
      tags: example.tags,
      components: collectComponentTypes(example.document),
      document: example.document,
      kind: "builtin",
    }));

    const publishedUserEntries: ExampleCatalogEntry[] = publishedTemplates
      .map((template) => {
        const parsed = parseDsl(template.source, template.format);
        if (!parsed.ast) {
          return null;
        }

        return {
          id: template.id,
          name: template.name,
          description: template.description || "User-published template",
          category: template.category || "Custom",
          tags: template.tags,
          components: collectComponentTypes(parsed.ast),
          document: parsed.ast,
          kind: "user" as const,
        };
      })
      .filter((entry): entry is ExampleCatalogEntry => entry !== null);

    return [...builtInEntries, ...publishedUserEntries].sort((left, right) => {
      const leftIndex = CATEGORY_ORDER.includes(left.category) ? CATEGORY_ORDER.indexOf(left.category) : CATEGORY_ORDER.length;
      const rightIndex = CATEGORY_ORDER.includes(right.category) ? CATEGORY_ORDER.indexOf(right.category) : CATEGORY_ORDER.length;
      const categoryOrder = leftIndex - rightIndex;
      if (categoryOrder !== 0) {
        return categoryOrder;
      }

      return left.name.localeCompare(right.name);
    });
  }, [publishedTemplates]);

  const builtInCount = catalogEntries.filter((entry) => entry.kind === "builtin").length;
  const publishedUserCount = catalogEntries.filter((entry) => entry.kind === "user").length;

  const groupedEntries = useMemo(() => {
    return catalogEntries.reduce<Record<string, ExampleCatalogEntry[]>>((groups, entry) => {
      if (!groups[entry.category]) {
        groups[entry.category] = [];
      }

      groups[entry.category].push(entry);
      return groups;
    }, {});
  }, [catalogEntries]);

  const coverageMap = useMemo(() => {
    return SUPPORTED_COMPONENT_TYPES.reduce<Record<ComponentType, ExampleCatalogEntry[]>>((map, componentType) => {
      map[componentType] = catalogEntries.filter((entry) => entry.components.includes(componentType));
      return map;
    }, {} as Record<ComponentType, ExampleCatalogEntry[]>);
  }, [catalogEntries]);

  const orderedCategories = useMemo(() => {
    const existingCategories = Object.keys(groupedEntries);
    return [
      ...CATEGORY_ORDER.filter((category) => existingCategories.includes(category)),
      ...existingCategories.filter((category) => !CATEGORY_ORDER.includes(category)),
    ];
  }, [groupedEntries]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader>
        <div className="flex rounded-md overflow-hidden border border-wire-stroke/30">
          <button
            onClick={() => setPreviewMode("wireframe")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              previewMode === "wireframe"
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            Wireframe Preview
          </button>
          <button
            onClick={() => setPreviewMode("ui")}
            className={`px-3 py-1 text-xs font-mono transition-colors ${
              previewMode === "ui"
                ? "bg-primary text-primary-foreground"
                : "text-console-fg hover:text-primary-foreground"
            }`}
          >
            UI Preview
          </button>
        </div>
        <Button asChild variant="outline" className="text-xs font-mono">
          <Link to="/">Open Editor</Link>
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto">
        <section className="border-b border-border bg-surface/60">
          <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
                Example Catalog
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Structured examples for every supported component and layout pattern
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                This catalog is driven by the same deterministic AST and renderer used in the editor.
                Open any example directly in WireframeDSL or JSON and continue editing from there.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Built-in examples</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{builtInCount}</div>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Published user templates</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">{publishedUserCount}</div>
              </div>
              <div className="rounded-xl border border-border bg-background p-5">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Component coverage</div>
                <div className="mt-2 text-3xl font-semibold text-foreground">
                  {SUPPORTED_COMPONENT_TYPES.filter((type) => coverageMap[type].length > 0).length}/{SUPPORTED_COMPONENT_TYPES.length}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Component index</h2>
                <p className="text-sm text-muted-foreground">
                  Cada tarjeta muestra qué ejemplos cubren cada tipo de componente soportado.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SUPPORTED_COMPONENT_TYPES.map((componentType) => (
                  <div key={componentType} className="rounded-xl border border-border bg-background p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-mono text-sm font-semibold text-foreground">{componentType}</h3>
                      <span className="text-xs text-muted-foreground">{coverageMap[componentType].length} examples</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coverageMap[componentType].map((entry) => (
                        <a
                          key={`${componentType}-${entry.id}`}
                          href={`#${entry.id}`}
                          className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                        >
                          {entry.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 space-y-12">
          {orderedCategories.map((category) => (
            <div key={category} className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">{category}</h2>
                  <p className="text-sm text-muted-foreground">
                    {groupedEntries[category].length} example{groupedEntries[category].length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {groupedEntries[category].map((entry) => (
                  <article
                    key={entry.id}
                    id={entry.id}
                    className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden"
                  >
                    <div className="border-b border-border px-5 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">{entry.name}</h3>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {entry.kind === "builtin" ? "Built-in" : "User"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={`${entry.id}-${tag}`}
                            className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {entry.components.map((componentType) => (
                          <span
                            key={`${entry.id}-${componentType}`}
                            className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
                          >
                            {componentType}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`h-[22rem] overflow-auto p-5 ${previewMode === "wireframe" ? "dot-grid-bg bg-wire-bg" : "bg-surface"}`}>
                      <NodeRenderer node={entry.document.root} mode={previewMode} />
                    </div>

                    <div className="border-t border-border px-5 py-4 flex flex-wrap gap-3">
                      <Button asChild size="sm">
                        <Link to={getEditorHref(entry, "yaml")}>Open WireframeDSL</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link to={getEditorHref(entry, "json")}>Open JSON</Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ExamplesPage;
