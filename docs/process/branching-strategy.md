# Branching Strategy

## Default Baseline

No repository-specific branching policy was found in the codebase, so use this as the default working agreement.

## Branch Types

- `feature/<scope>` for user-visible changes
- `fix/<scope>` for bugs
- `refactor/<scope>` for behavior-preserving structural work
- `docs/<scope>` for documentation-only changes
- `chore/<scope>` for tooling or maintenance

## Rules

- Keep `main` releasable.
- One branch should address one coherent concern.
- Prefer small pull requests over long-lived branches.
- Rebase or merge from the latest `main` before opening a final review if the branch has drifted.
- Avoid mixing refactors, feature work, and unrelated formatting in the same branch.

## Practical Guidance For This Repo

- If a branch changes the DSL contract, include tests and docs in the same branch.
- If a branch touches generated UI files, call that out explicitly in the PR because review cost is higher.
- If the only change is documentation or prompt scaffolding, keep the branch docs-only so reviewers can skim it quickly.
