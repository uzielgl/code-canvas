# Documentation Map

This folder is the working documentation set for the current codebase, not a generic template.

## Structure

- `ai/`: project context and operating rules for AI or agent-assisted work
- `architecture/`: how the app is organized and why
- `process/`: default engineering workflow for changes and reviews
- `prompts/`: reusable prompt templates tailored to this repository

## Update Rules

- If code and docs disagree, the code is the source of truth until the docs are updated in the same change.
- Any change to the DSL contract should update `docs/ai/`, `docs/architecture/`, tests, and user-facing examples together.
- Process docs in this folder are the recommended baseline for this repository because no stricter policy was found elsewhere in the project.
