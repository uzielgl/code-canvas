import { describe, expect, it } from "vitest";
import {
  createStoredTemplate,
  normalizeTags,
  sortTemplatesByUpdatedAt,
  updateStoredTemplate,
} from "./template-store";

describe("template store helpers", () => {
  it("normalizes comma-separated tag input", () => {
    expect(normalizeTags("crm, dashboard,  table ")).toEqual(["crm", "dashboard", "table"]);
  });

  it("creates and updates stored templates", () => {
    const template = createStoredTemplate({
      name: "Customer dashboard",
      description: "A saved layout",
      category: "Custom",
      tags: ["crm", "table"],
      includeInExamples: true,
      format: "yaml",
      source: "root:\n  type: window\n",
    });

    const updatedTemplate = updateStoredTemplate(template, {
      name: "Revenue dashboard",
      category: "Analytics",
      tags: ["analytics", "revenue"],
      includeInExamples: false,
    });

    expect(updatedTemplate.name).toBe("Revenue dashboard");
    expect(updatedTemplate.category).toBe("Analytics");
    expect(updatedTemplate.tags).toEqual(["analytics", "revenue"]);
    expect(updatedTemplate.includeInExamples).toBe(false);
    expect(updatedTemplate.updatedAt >= template.updatedAt).toBe(true);
  });

  it("sorts templates by updated date descending", () => {
    const sorted = sortTemplatesByUpdatedAt([
      {
        id: "older",
        name: "Older",
        description: "",
        category: "Custom",
        tags: [],
        format: "yaml",
        source: "",
        includeInExamples: false,
        createdAt: "2026-03-18T00:00:00.000Z",
        updatedAt: "2026-03-18T00:00:00.000Z",
      },
      {
        id: "newer",
        name: "Newer",
        description: "",
        category: "Custom",
        tags: [],
        format: "yaml",
        source: "",
        includeInExamples: false,
        createdAt: "2026-03-18T00:00:00.000Z",
        updatedAt: "2026-03-18T01:00:00.000Z",
      },
    ]);

    expect(sorted.map((template) => template.id)).toEqual(["newer", "older"]);
  });
});
