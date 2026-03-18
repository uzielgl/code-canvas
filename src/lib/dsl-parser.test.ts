import { describe, expect, it } from "vitest";
import { parseDsl, serializeDsl } from "./dsl-parser";
import type { DslRoot } from "./dsl-schema";

const sampleDocument: DslRoot = {
  root: {
    type: "window",
    props: { title: "Parser Test" },
    children: [
      {
        type: "card",
        props: { title: "Profile" },
        children: [
          {
            type: "text",
            props: { content: "Hello" },
          },
        ],
      },
    ],
  },
};

describe("dsl parser", () => {
  it("parses valid WireframeDSL YAML", () => {
    const source = serializeDsl(sampleDocument, "yaml");
    const result = parseDsl(source, "yaml");

    expect(result.errors).toEqual([]);
    expect(result.ast).toEqual(sampleDocument);
  });

  it("parses valid JSON", () => {
    const source = serializeDsl(sampleDocument, "json");
    const result = parseDsl(source, "json");

    expect(result.errors).toEqual([]);
    expect(result.ast).toEqual(sampleDocument);
  });

  it("returns JSON parse errors without falling back to YAML semantics", () => {
    const invalidJson = `{
  "root": {
    "type": "window",
    "props": {
      "title": "Broken"
    },
  }
}`;

    const result = parseDsl(invalidJson, "json");

    expect(result.ast).toBeNull();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message.toLowerCase()).toContain("json");
  });
});
