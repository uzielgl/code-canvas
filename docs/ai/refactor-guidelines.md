# Refactor Guidelines

## Goal

Refactors in this repository should reduce drift and improve clarity without silently changing the YAML contract or the preview behavior.

## Highest-Risk Areas

## DSL Contract Cluster

These files must stay in sync:

- [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts)
- [`src/lib/dsl-parser.ts`](../../src/lib/dsl-parser.ts)
- [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx)
- [`src/lib/default-template.ts`](../../src/lib/default-template.ts)
- docs and tests

If only one of them changes, the project becomes misleading very quickly.

## Renderer Growth

[`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx) currently handles all node types in one switch. Safe refactors are:

- extracting pure render helpers by node family
- moving prop normalization into small utility functions
- introducing typed renderer maps if behavior remains equivalent

Unsafe refactors are:

- changing prop names without updating templates and docs
- moving logic into many files without adding tests
- mixing app behavior changes with cosmetic restructuring

## Generated UI Layer

Treat `src/components/ui/*` as generated primitives. Only refactor those files when:

- a bug is coming from the wrapper itself
- the project is intentionally changing its shared UI base
- lint cleanup is part of the explicit task

Otherwise, prefer changes in app-owned files.

## Safe Refactor Sequence

1. Capture the current behavior and touched files.
2. Identify the real source of truth for the behavior.
3. Make the smallest structural change that improves readability.
4. Add or update tests before broad follow-up cleanup.
5. Run `npm run build`, `npm test`, and `npm run lint`.
6. Update docs if the mental model or file ownership changed.

## Refactor Priorities

- First: remove schema-renderer-template drift
- Second: isolate pure logic from React components
- Third: improve type clarity in app-owned files
- Fourth: only then consider larger architectural extraction

## Do Not

- refactor README examples and code independently
- move state out of [`src/pages/Index.tsx`](../../src/pages/Index.tsx) unless there is a clear new ownership boundary
- introduce new abstractions around the renderer without tests
- use a refactor as cover for behavior changes that should be reviewed separately
