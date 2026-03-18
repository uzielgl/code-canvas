# Architecture Decisions

## ADR-001: YAML Is The Authoring Format

- Status: accepted
- Why: the tool is positioned as a readable UI-as-code wireframing surface, and YAML is approachable for quick authoring.
- Consequence: parsing and validation must produce helpful errors because users are writing text directly.

## ADR-002: The DSL Must Stay Strict And Deterministic

- Status: accepted
- Why: the founding product brief explicitly rejected AI interpretation of text.
- Consequence: features should operate on explicit structure, not ambiguous natural-language intent.

## ADR-003: Runtime Schema Validation Guards The App

- Status: accepted
- Why: TypeScript is configured loosely and the DSL originates from free-form user input.
- Consequence: [`src/lib/dsl-schema.ts`](../../src/lib/dsl-schema.ts) is a critical safety boundary and must stay synchronized with rendering.

## ADR-004: Render The AST Directly In React

- Status: accepted
- Why: the app is small, synchronous, and focused on immediate feedback.
- Consequence: [`src/components/DslRenderer.tsx`](../../src/components/DslRenderer.tsx) is simple to follow, but DSL expansion increases the risk of a large switch statement drifting.

## ADR-005: One AST, Two Presentation Modes

- Status: accepted
- Why: wireframe and UI mode should show the same structure with different visual fidelity.
- Consequence: new node types should support both modes together instead of only one branch.

## ADR-006: Persist Templates Outside The Browser

- Status: accepted
- Why: user-created templates must survive browser cache clears and server restarts.
- Consequence: template storage flows through a local server repository and disk-backed JSON file.

## ADR-007: Keep The Product As A Single-Screen Workbench With Supporting Routes

- Status: accepted
- Why: the current workflow is tightly centered on edit, validate, and preview.
- Consequence: new routes should be a deliberate product decision, not incidental growth. Current support routes are `/examples` and `/docs`.

## ADR-008: Generated shadcn Files Are A Shared Primitive Layer

- Status: accepted
- Why: the repository includes a large generated UI surface that is not the core product logic.
- Consequence: app changes should prefer composition over editing generated files.

## ADR-009: Documentation And Tests Currently Trail The Implementation

- Status: open debt
- Why: the checked-in README describes an older DSL shape, and automated tests do not yet protect the core pipeline.
- Consequence: contract changes are high risk until docs and tests are brought closer to the code.
