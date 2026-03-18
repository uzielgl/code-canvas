import type { DslFormat } from "./dsl-parser";

export interface StoredTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  format: DslFormat;
  source: string;
  includeInExamples: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMetadataInput {
  name: string;
  description: string;
  category: string;
  tags: string[];
  includeInExamples: boolean;
}

export interface TemplateContentInput extends TemplateMetadataInput {
  format: DslFormat;
  source: string;
}

function generateTemplateId(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueSuffix = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : Date.now().toString(36);

  return `${base || "template"}-${uniqueSuffix}`;
}

export function normalizeTags(tags: string[] | string): string[] {
  const values = Array.isArray(tags) ? tags : tags.split(",");
  return values
    .map((item) => item.trim())
    .filter(Boolean);
}

export function sortTemplatesByUpdatedAt(templates: StoredTemplate[]): StoredTemplate[] {
  return [...templates].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function createStoredTemplate(input: TemplateContentInput): StoredTemplate {
  const timestamp = new Date().toISOString();

  return {
    id: generateTemplateId(input.name),
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category.trim() || "Custom",
    tags: normalizeTags(input.tags),
    format: input.format,
    source: input.source,
    includeInExamples: input.includeInExamples,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateStoredTemplate(
  template: StoredTemplate,
  updates: Partial<TemplateContentInput>,
): StoredTemplate {
  return {
    ...template,
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
    ...(updates.category !== undefined ? { category: updates.category.trim() || "Custom" } : {}),
    ...(updates.tags !== undefined ? { tags: normalizeTags(updates.tags) } : {}),
    ...(updates.format !== undefined ? { format: updates.format } : {}),
    ...(updates.source !== undefined ? { source: updates.source } : {}),
    ...(updates.includeInExamples !== undefined ? { includeInExamples: updates.includeInExamples } : {}),
    updatedAt: new Date().toISOString(),
  };
}
