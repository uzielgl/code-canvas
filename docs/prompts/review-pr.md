# Review PR Prompt

Use this when asking an AI assistant to review a branch or patch for problems.

```text
Review this change in the WireframeDSL repository.

Scope:
<diff-or-files>

Review instructions:
- Prioritize bugs, regressions, DSL contract drift, and missing tests
- Treat src/lib/dsl-schema.ts as the contract source of truth
- Check whether renderer, templates, docs, and tests stayed aligned
- Be skeptical of generated src/components/ui/* changes
- Keep summaries brief; findings come first

Output format:
1. Findings ordered by severity
2. Open questions or assumptions
3. Short change summary

Do not spend time praising the code. Focus on issues that would matter before merge.
```
