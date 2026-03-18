# Generate Tests Prompt

Use this when asking an AI assistant to add or expand automated coverage in this repository.

```text
You are working in the WireframeDSL repository.

Goal:
Add tests for <behavior>.

Repository context:
- Stack: Vite, React, TypeScript, Vitest, Testing Library
- DSL source of truth: src/lib/dsl-schema.ts
- Parser: src/lib/dsl-parser.ts
- Renderer: src/components/DslRenderer.tsx
- Current tests are minimal, so prefer high-signal tests over broad snapshots

Requirements:
- Test the lowest sensible layer first
- Use short YAML strings or small AST fixtures
- Cover both success and failure cases when the DSL contract is involved
- Avoid brittle snapshot-only tests
- If behavior differs in wireframe vs ui mode, assert both

Validation:
- Run npm test
- Run npm run build
- Run npm run lint and separate pre-existing failures from new ones

Deliver:
1. Files changed
2. What behavior is now covered
3. Remaining gaps
```
