import React from "react";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DSL_COMPONENT_REFERENCE,
  DSL_CORE_RULES,
  DSL_INTERACTION_GUIDE,
  DSL_QUICKSTART_EXAMPLE,
  MENU_PROMPT_GUIDE,
} from "@/lib/dsl-reference";

const DocumentationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader>
        <Button asChild variant="outline" className="text-xs font-mono">
          <Link to="/">Open Editor</Link>
        </Button>
        <Button asChild variant="outline" className="text-xs font-mono">
          <Link to="/examples">Browse Examples</Link>
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto">
        <section className="border-b border-border bg-surface/60">
          <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">
                DSL Documentation
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                Guía completa para escribir YAML de WireframeDSL
              </h1>
              <p className="max-w-3xl text-base text-muted-foreground">
                Esta página describe la sintaxis real soportada por la app: estructura base,
                componentes disponibles, propiedades y recetas listas para pasarle a una IA.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Reglas base</h2>
                <div className="space-y-2">
                  {DSL_CORE_RULES.map((rule) => (
                    <div key={rule} className="rounded-xl border border-border px-4 py-3 text-sm text-foreground">
                      {rule}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Prompt guide para IA</h2>
                <pre className="overflow-x-auto rounded-xl bg-deep-slate p-4 text-sm text-console-fg whitespace-pre-wrap">
                  <code>{MENU_PROMPT_GUIDE}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 space-y-10">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Quickstart YAML</h2>
              <p className="text-sm text-muted-foreground">
                Ejemplo mínimo con `window`, `menu`, `row`, `column`, `card` y `text`.
              </p>
            </div>
            <pre className="overflow-x-auto rounded-2xl bg-deep-slate p-5 text-sm text-console-fg">
              <code>{DSL_QUICKSTART_EXAMPLE}</code>
            </pre>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Interaction Guide</h2>
              <p className="text-sm text-muted-foreground">
                Cómo modelar navegación, links, tabs activas y templates guardados por nombre.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              {DSL_INTERACTION_GUIDE.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden"
                >
                  <div className="border-b border-border px-5 py-4">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="px-5 py-4">
                    <pre className="overflow-x-auto rounded-xl bg-deep-slate p-4 text-sm text-console-fg whitespace-pre-wrap">
                      <code>{item.example}</code>
                    </pre>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Component reference</h2>
              <p className="text-sm text-muted-foreground">
                Todos los componentes soportados actualmente por el parser y el renderer.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {DSL_COMPONENT_REFERENCE.map((component) => (
                <article
                  key={component.type}
                  className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden"
                >
                  <div className="border-b border-border px-5 py-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-lg font-semibold text-foreground">{component.type}</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                        component
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{component.description}</p>
                  </div>

                  <div className="px-5 py-4 space-y-5">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Props</h4>
                      {component.props.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                          No requiere props específicas.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {component.props.map((prop) => (
                            <div
                              key={`${component.type}-${prop.name}`}
                              className="rounded-xl border border-border px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-sm font-semibold text-foreground">{prop.name}</span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  {prop.type}
                                </span>
                                {prop.required && (
                                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-destructive">
                                    required
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{prop.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {component.notes && component.notes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Notes</h4>
                        <div className="space-y-2">
                          {component.notes.map((note) => (
                            <div
                              key={`${component.type}-${note}`}
                              className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Example</h4>
                      <pre className="overflow-x-auto rounded-xl bg-deep-slate p-4 text-sm text-console-fg whitespace-pre-wrap">
                        <code>{component.example}</code>
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DocumentationPage;
