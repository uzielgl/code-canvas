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

  it("accepts a menu component with grouped items and badges", () => {
    const source = `root:
  type: window
  children:
    - type: menu
      props:
        groups:
          - title: Shop
            items:
              - label: Products
                icon: products
                badge: 3
              - label: Orders
                icon: orders
                active: true
`;

    const result = parseDsl(source, "yaml");

    expect(result.errors).toEqual([]);
    expect(result.ast?.root.children?.[0].type).toBe("menu");
  });

  it("accepts a templates include node with a name", () => {
    const source = `root:
  type: window
  children:
    - type: templates
      props:
        name: layout.menu
        active: Dashboard
`;

    const result = parseDsl(source, "yaml");

    expect(result.errors).toEqual([]);
    expect(result.ast?.root.children?.[0].type).toBe("templates");
  });

  it("rejects a templates include node without a name", () => {
    const source = `root:
  type: window
  children:
    - type: templates
      props:
        active: Dashboard
`;

    const result = parseDsl(source, "yaml");

    expect(result.ast).toBeNull();
    expect(result.errors.map((error) => error.message).join("\\n")).toContain('"name" must be a non-empty string');
  });

  it("accepts table rows with embedded button nodes as cells", () => {
    const source = `root:
  type: window
  children:
    - type: table
      props:
        columns: [ID, Nombre, Acciones]
        rows:
          - [1, "Boda de Ana & Luis", { type: button, props: { text: "Ver", variant: primary, link: "Businesses" } }]
`;

    const result = parseDsl(source, "yaml");

    expect(result.errors).toEqual([]);
    expect(result.ast?.root.children?.[0].type).toBe("table");
  });
});
