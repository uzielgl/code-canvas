# Definition Of Done

A change is done in this repository when all of the following are true.

## Product And Behavior

- The requested behavior works in the running app.
- Existing supported DSL flows still work unless the task intentionally changes them.
- If the change affects rendering, it behaves correctly in both `wireframe` and `ui` mode.

## Code Quality

- The smallest sensible set of files was changed.
- App-owned logic lives in app-owned files.
- New code is typed and readable without relying on the relaxed TypeScript baseline.

## Tests And Validation

- New behavior has automated coverage at the cheapest sensible level.
- `npm run build` passes.
- `npm test` passes.
- `npm run lint` was run and any remaining failures are either fixed or explicitly identified as pre-existing baseline issues.

## Documentation

- If the DSL contract changed, docs and examples were updated.
- If architecture or ownership changed, the relevant file in `docs/` was updated.
- Prompt templates were updated if the standard implementation workflow changed.

## Review Readiness

- The diff is focused.
- Risks and tradeoffs are clear.
- Follow-up work is called out instead of being hidden.
