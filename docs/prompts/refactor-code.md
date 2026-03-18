# Refactor Code Prompt

Use this when asking an AI assistant to improve structure without intentionally changing behavior.

```text
You are refactoring code in the WireframeDSL repository.

Refactor target:
<files-or-module>

Constraints:
- Preserve current behavior unless explicitly told otherwise
- Do not change the DSL contract silently
- Avoid broad edits in generated src/components/ui/* files unless the task is about that layer
- Keep docs and tests aligned if the mental model or ownership changes

Approach:
1. Explain the current responsibilities and coupling
2. Propose the smallest refactor that reduces risk or duplication
3. Implement it
4. Add regression tests if the refactor touches risky logic
5. Run npm run build, npm test, and npm run lint

Output:
1. What was refactored
2. Why the new structure is better
3. Behavior-preservation checks
4. Remaining debt not addressed
```
