# Implement Feature Prompt

Use this when asking an AI assistant to implement a product change in this repository.

```text
You are implementing a feature in the WireframeDSL repository.

Feature:
<feature-request>

Repository rules:
- The real DSL contract lives in src/lib/dsl-schema.ts
- If the DSL contract changes, update schema, renderer, default templates, tests, and docs together
- Prefer app-owned files over editing generated src/components/ui/* files
- Keep the current single-page editor + preview workflow unless the feature explicitly changes it

Required workflow:
1. Inspect the relevant files first
2. Make the smallest coherent code change
3. Add or update automated tests for the changed behavior
4. Run npm run build, npm test, and npm run lint
5. Report any pre-existing baseline issues separately from new failures

Output:
1. Short implementation summary
2. Files changed and why
3. Validation results
4. Open risks or follow-ups
```
