import { describe, expect, it } from "vitest";
import { SUPPORTED_COMPONENT_TYPES } from "./dsl-schema";
import { DSL_COMPONENT_REFERENCE } from "./dsl-reference";

describe("dsl reference", () => {
  it("documents every supported component", () => {
    expect(DSL_COMPONENT_REFERENCE.map((component) => component.type).sort()).toEqual(
      [...SUPPORTED_COMPONENT_TYPES].sort(),
    );
  });
});
