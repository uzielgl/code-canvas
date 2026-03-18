# Code Review

## Review Priorities

Review this repository from highest to lowest risk in this order.

1. DSL contract drift
2. Broken preview behavior
3. Missing tests for changed behavior
4. Unnecessary edits in generated UI files
5. Documentation drift

## Repository-Specific Checklist

- Does the change keep [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts), [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx), templates, tests, and docs aligned?
- If a new node type or prop was added, does it work in both `wireframe` and `ui` mode?
- Are validation errors still understandable when the DSL is malformed?
- Does the last valid AST fallback still behave correctly when parsing fails?
- Were generated `src/components/ui/*` files changed only when necessary?
- Were README examples or docs updated if the DSL contract changed?
- Did the author run `npm run build`, `npm test`, and `npm run lint`, and did they explain any remaining failures?

## Merge Blockers

- A contract change that only updates one layer of the app
- A UI behavior change without an automated test where the behavior is practical to test
- A PR that increases the existing lint failure baseline without explanation
- Broad generated-file changes with no clear justification
