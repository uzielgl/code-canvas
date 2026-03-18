import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("template repository", () => {
  let tempDirectory = "";

  beforeEach(async () => {
    tempDirectory = await mkdtemp(path.join(os.tmpdir(), "wireframedsl-templates-"));
    process.env.TEMPLATE_STORAGE_FILE = path.join(tempDirectory, "templates.json");
    vi.resetModules();
  });

  afterEach(async () => {
    delete process.env.TEMPLATE_STORAGE_FILE;
    await rm(tempDirectory, { recursive: true, force: true });
  });

  it("persists template mutations to disk", async () => {
    const repository = await import("./template-repository");

    const created = await repository.createTemplateRecord({
      name: "Server persisted template",
      description: "Stored outside the browser",
      category: "Custom",
      tags: ["server", "disk"],
      includeInExamples: true,
      format: "yaml",
      source: "root:\n  type: window\n",
    });

    const listedAfterCreate = await repository.listTemplates();
    expect(listedAfterCreate).toHaveLength(1);
    expect(listedAfterCreate[0].id).toBe(created.id);

    const renamedTemplate = await repository.updateTemplateMetadataRecord(created.id, {
      name: "Updated template",
      description: "Metadata only",
      category: "Examples",
      tags: ["updated"],
      includeInExamples: false,
    });

    await repository.overwriteTemplateRecord(renamedTemplate.id, {
      name: "Updated template",
      description: "Overwrite content",
      category: "Examples",
      tags: ["updated", "content"],
      includeInExamples: true,
      format: "json",
      source: "{\n  \"root\": {\n    \"type\": \"window\"\n  }\n}",
    });

    const listedAfterOverwrite = await repository.listTemplates();
    expect(listedAfterOverwrite[0].id).toBe("updated-template");
    expect(listedAfterOverwrite[0].format).toBe("json");
    expect(listedAfterOverwrite[0].includeInExamples).toBe(true);

    await repository.deleteTemplateRecord("updated-template");
    expect(await repository.listTemplates()).toEqual([]);
  });

  it("rejects duplicate template names", async () => {
    const repository = await import("./template-repository");

    await repository.createTemplateRecord({
      name: "Admin Dashboard",
      description: "",
      category: "Custom",
      tags: [],
      includeInExamples: false,
      format: "yaml",
      source: "root:\n  type: window\n",
    });

    await expect(repository.createTemplateRecord({
      name: "admin dashboard",
      description: "",
      category: "Custom",
      tags: [],
      includeInExamples: false,
      format: "yaml",
      source: "root:\n  type: window\n",
    })).rejects.toMatchObject({ statusCode: 409 });
  });
});
