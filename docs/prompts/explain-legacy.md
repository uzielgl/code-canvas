# Explain Legacy Prompt

Use this when you want an AI assistant to explain an unfamiliar area of the repository without making changes.

```text
You are reading the WireframeDSL repository, a Vite + React + TypeScript app that turns YAML into a live UI preview.

Explain the following area of the codebase:
<files-or-feature>

Requirements:
- Use the actual implementation, not assumptions from README examples.
- Treat src/lib/dsl-schema.ts as the DSL contract source of truth.
- Explain the data flow, file ownership, and important tradeoffs.
- Call out hidden coupling, drift risks, and pre-existing technical debt.
- Keep the explanation practical for an engineer who may need to change this code next.

Output:
1. Summary
2. File-by-file responsibilities
3. Data flow
4. Risks and caveats
5. Safe places to modify vs places to avoid
```
