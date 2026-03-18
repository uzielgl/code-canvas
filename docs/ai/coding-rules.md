# Coding Rules

## Purpose

These rules are for making safe changes in the current WireframeDSL codebase.

## Hard Rules

- Treat [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts) as the DSL contract source of truth.
- Keep the product deterministic. Do not add features that infer UI from free-form natural language unless the product direction explicitly changes.
- When adding or changing a DSL node type, update all affected surfaces together:
  - [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts)
  - [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx)
  - [`src/lib/default-template.ts`](../../src/lib/default-template.ts)
  - [`src/lib/dsl-reference.ts`](../../src/lib/dsl-reference.ts)
  - tests and docs
- Keep parsing and validation logic in `src/lib/`. Keep rendering and interaction logic in `src/components/` and `src/pages/`.
- Prefer app-specific components before editing `src/components/ui/*`. Most files in `src/components/ui/` are generated shadcn wrappers and should be treated as vendor-style code.
- Prefer `@/` imports over long relative paths inside `src/`.
- Preserve the current "last valid AST stays visible while the DSL has errors" behavior unless the task explicitly changes that UX.
- Keep new data under `node.props` unless you are intentionally changing the DSL schema.
- Write new code as typed TypeScript even though the repository currently uses relaxed compiler settings.
- Keep Monaco as the authoring surface unless there is an explicit product decision to replace it.
- Treat persisted templates as server-owned data. The source of truth lives in `storage/templates.json` through [`server/template-repository.ts`](../../server/template-repository.ts), not in browser cache.

## Current DSL Shape

The implemented DSL is YAML with a top-level `root` object and nested nodes shaped like:

```yaml
root:
  type: window
  props:
    title: Example
  children:
    - type: text
      props:
        content: Hello
```

Do not follow the older `component:` examples in `README.md` when changing the implementation.

## Change Guidelines

- Small UI changes: keep state wiring in [`src/pages/Index.tsx`](../../src/pages/Index.tsx) and leaf rendering in the relevant component.
- DSL contract changes: start in the schema, then renderer, then templates, then tests, then docs.
- If you change how templates are saved, opened, or renamed, update both the frontend client in [`src/lib/template-api.ts`](../../src/lib/template-api.ts) and the repository in [`server/template-repository.ts`](../../server/template-repository.ts).
- Styling changes: prefer existing Tailwind tokens from [`src/index.css`](../../src/index.css) and [`tailwind.config.ts`](../../tailwind.config.ts).
- New routes: avoid unless the feature truly needs multi-page behavior. The current app is designed as a single-screen workstation.

## Validation Commands

- `npm run build`
- `npm test`
- `npm run lint`

## Baseline Status On March 18, 2026

- `npm run build`: passes
- `npm test`: passes, but only a placeholder example test exists
- `npm run lint`: fails
  - existing errors in generated UI files (`command.tsx`, `textarea.tsx`)
  - existing error in [`src/lib/dsl-parser.ts`](../../src/lib/dsl-parser.ts) for `any`
  - existing error in [`tailwind.config.ts`](../../tailwind.config.ts) for `require()`

When making unrelated changes, do not introduce additional lint failures. If you touch one of the failing files, either fix it or clearly call out that the baseline issue remains.
