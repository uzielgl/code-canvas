import { describe, expect, it } from "vitest";
import { SUPPORTED_COMPONENT_TYPES } from "./dsl-schema";
import { BUILT_IN_EXAMPLES, collectComponentTypes } from "./template-catalog";

describe("template catalog", () => {
  it("covers every supported component type across the built-in examples", () => {
    const coveredTypes = new Set(
      BUILT_IN_EXAMPLES.flatMap((example) => collectComponentTypes(example.document)),
    );

    expect(Array.from(coveredTypes).sort()).toEqual([...SUPPORTED_COMPONENT_TYPES].sort());
  });
});
