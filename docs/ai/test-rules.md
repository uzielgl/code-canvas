# Test Rules

## Current Baseline

- Test runner: Vitest
- DOM environment: JSDOM
- Setup file: [`src/test/setup.ts`](../../src/test/setup.ts)
- Current automated coverage: one placeholder test only
- E2E status: Playwright config exists, but there are no repo specs yet

## Required Test Thinking

Every change should answer: what could break in the YAML-to-preview pipeline, and where is the cheapest test that catches it?

## Test Priorities

## Parser And Schema

Add unit tests when changing:

- accepted node types
- required or optional props
- validation error formatting
- top-level DSL shape

Focus on `parseDsl()` and `validateDsl()` first. They are pure and cheap to test.

## Renderer

Add component tests when changing:

- rendering for any node type
- mode differences between `wireframe` and `ui`
- table, tabs, modal, or form control behavior

Prefer focused tests against [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx) or [`src/components/LiveCanvas.tsx`](../../src/components/LiveCanvas.tsx) instead of only broad page snapshots.

## Page Integration

Add integration tests against [`src/pages/Index.tsx`](../../src/pages/Index.tsx) when changing:

- editor-to-canvas synchronization
- template loading
- mode switching
- error handling and last-valid-preview behavior

## Commands

- `npm test`
- `npm run build`
- `npm run lint`

## Minimum Done Bar

- New behavior is covered by at least one automated test at the lowest sensible level.
- Existing behavior that was easy to break during the change has regression coverage.
- If lint is still red, the change did not add new lint failures outside the known baseline.

## Good Testing Habits For This Repo

- Prefer real AST objects or short YAML strings over large fixtures.
- Keep parser tests table-driven.
- Avoid brittle style snapshots; assert on behavior and visible content.
- If a DSL feature changes, update both positive and negative validation tests.
