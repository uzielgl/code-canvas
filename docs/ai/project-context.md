# Project Context

## What This Project Is

This repository is a browser-based UI-as-code workbench for authoring wireframes in YAML or structured JSON and seeing the result rendered live in React. The current user experience is centered on a split-screen editor:

- left: Monaco editor plus validation console
- right: live canvas rendered in `wireframe` or `ui` mode

## Founding Product Brief

The application was originally created from a prompt with these hard requirements:

- Monaco editor for writing a structured DSL
- real-time preview
- parser that converts DSL into a deterministic JSON AST
- renderer that maps the AST to UI components
- supported components limited to the declared wireframing set
- split-screen layout with editor on the left and preview on the right
- validation errors
- wireframe mode and styled UI mode
- no AI interpretation of text
- strictly structured and deterministic DSL

That means the product intent is not "describe a UI in natural language and let the system guess." It is "author an explicit DSL and render it predictably."

## Core User Flow

1. The user edits YAML in [`src/components/DslEditor.tsx`](../../src/components/DslEditor.tsx).
2. [`src/pages/Index.tsx`](../../src/pages/Index.tsx) calls `parseDsl(source)` on every DSL change.
3. [`src/lib/dsl-parser.ts`](../../src/lib/dsl-parser.ts) parses YAML with `js-yaml` and delegates validation to [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts).
4. If parsing succeeds, the AST is stored and rendered.
5. If parsing fails, the validation console shows errors and the canvas keeps the last valid AST on screen.
6. [`src/components/GlobalToolbar.tsx`](../../src/components/GlobalToolbar.tsx) switches render mode, exposes the current template name, quick template access, save actions, and AST copy.
7. The `/examples` route exposes a larger catalog of built-in examples and published user templates.
8. The `/docs` route exposes an in-app DSL reference intended for humans and AI assistants.
9. The live preview supports interactive tabs and DSL links that can open external URLs or saved templates by name.

## Actual Supported Node Types

- `window`
- `row`
- `column`
- `grid`
- `table`
- `input`
- `textarea`
- `select`
- `checkbox`
- `button`
- `label`
- `text`
- `modal`
- `card`
- `tabs`
- `menu`

These are defined in [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts) and rendered in [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx).

## File Map

- `src/pages/Index.tsx`: top-level page state and layout
- `src/components/DslEditor.tsx`: Monaco YAML editor
- `src/components/ValidationConsole.tsx`: parse and validation feedback
- `src/components/LiveCanvas.tsx`: preview panel shell
- `src/components/DslRenderer.tsx`: AST-to-React renderer
- `src/lib/dsl-parser.ts`: YAML parsing and error normalization
- `src/lib/dsl-schema.ts`: runtime schema validation
- `src/lib/dsl-reference.ts`: in-app DSL documentation dataset
- `src/lib/default-template.ts`: built-in starter DSL templates
- `src/pages/Examples.tsx`: example catalog route
- `src/pages/Documentation.tsx`: in-app docs route
- `src/lib/template-api.ts`: frontend API client for persisted templates
- `server/template-repository.ts`: disk-backed template persistence
- `src/components/ui/*`: generated shadcn/Radix primitives

## Current Engineering Snapshot On March 18, 2026

- Build is healthy: `npm run build` passes.
- Unit test coverage exists for parser, reference integrity, catalog coverage, and template persistence, but UI interaction coverage is still thin.
- Playwright config exists, but there are no repository e2e specs yet.
- Lint is not green due to a mix of generated UI files and a small number of core-file issues.
- Saved templates are persisted on disk in `storage/templates.json`, not browser storage.
- The app now supports both a menu/navigation DSL component and an in-app `/docs` reference page.
- Templates are saved by unique name and use a slugged version of the name as their persistent `id`.

## Known Gaps And Risks

- `README.md` still documents an older `component:`-based DSL, while the implementation uses `root` + `type` + `props`.
- The renderer is a single switch statement with local UI state for interactive previews like tabs, which keeps the app simple but makes DSL growth easy to break if updates are not coordinated.
- The TypeScript config is intentionally loose (`strict: false` / relaxed null checks), so runtime validation is doing most of the safety work.
- Test coverage does not currently protect the parser, schema, or renderer behavior in a meaningful way.
- Future features should be screened against the original constraint that the tool stays deterministic and does not infer UI from free-form prose.
