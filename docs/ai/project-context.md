# Project Context

## What This Project Is

This repository is a browser-based UI-as-code workbench for authoring wireframes in YAML and seeing the result rendered live in React. The current user experience is a split-screen editor:

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
6. [`src/components/GlobalToolbar.tsx`](../../src/components/GlobalToolbar.tsx) switches render mode, loads templates, and copies the AST as JSON.

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

These are defined in [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts) and rendered in [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx).

## File Map

- `src/pages/Index.tsx`: top-level page state and layout
- `src/components/DslEditor.tsx`: Monaco YAML editor
- `src/components/ValidationConsole.tsx`: parse and validation feedback
- `src/components/LiveCanvas.tsx`: preview panel shell
- `src/components/DslRenderer.tsx`: AST-to-React renderer
- `src/lib/dsl-parser.ts`: YAML parsing and error normalization
- `src/lib/dsl-schema.ts`: runtime schema validation
- `src/lib/default-template.ts`: built-in starter DSL templates
- `src/components/ui/*`: generated shadcn/Radix primitives

## Current Engineering Snapshot On March 18, 2026

- Build is healthy: `npm run build` passes.
- Unit test setup exists with Vitest + Testing Library, but coverage is almost empty.
- Playwright config exists, but there are no repository e2e specs yet.
- Lint is not green due to a mix of generated UI files and a small number of core-file issues.

## Known Gaps And Risks

- `README.md` still documents an older `component:`-based DSL, while the implementation uses `root` + `type` + `props`.
- The renderer is a single switch statement, which keeps the app simple but makes DSL growth easy to break if updates are not coordinated.
- The TypeScript config is intentionally loose (`strict: false` / relaxed null checks), so runtime validation is doing most of the safety work.
- Test coverage does not currently protect the parser, schema, or renderer behavior in a meaningful way.
- Future features should be screened against the original constraint that the tool stays deterministic and does not infer UI from free-form prose.
