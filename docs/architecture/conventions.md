# Conventions

## Source Layout

- Put pure parsing, validation, and shared helpers in `src/lib/`.
- Put app-owned UI composition in `src/components/`.
- Put page-level state and layout in `src/pages/`.
- Avoid creating new top-level folders unless there is repeated pressure for one.

## Imports

- Prefer `@/` aliases for imports inside `src/`.
- Keep imports grouped by external packages, then internal modules.

## React Conventions

- Use function components and explicit prop interfaces.
- Keep state close to the page or component that owns the interaction.
- Extract pure logic before extracting new hooks.
- Avoid introducing context or global state for local editor/canvas concerns.

## DSL Conventions

- The top-level DSL key is `root`.
- Node identity is `type`, optional `id`, optional `props`, optional `children`.
- New display data should live inside `props`.
- Container behavior should be defined by the schema, not inferred ad hoc in the renderer.

## Styling Conventions

- Reuse the design tokens already defined in [`src/index.css`](../../src/index.css).
- Prefer static Tailwind class names over runtime-composed utility fragments where possible.
- Use the existing `wireframe` vs `ui` visual split instead of creating a third styling mode casually.

## Shared UI Conventions

- Treat `src/components/ui/*` as a shared primitive layer.
- Keep app-specific behavior out of those files.
- If you need a custom composite component, create it outside `src/components/ui/`.

## Testing And Docs

- Co-locate small tests near the feature when useful, or keep them under `src/test/` if they are cross-cutting.
- Update docs when the mental model, DSL contract, or workflow changes.
- Do not let README examples diverge from the implemented DSL.
