import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createStoredTemplate,
  sortTemplatesByUpdatedAt,
  updateStoredTemplate,
  type StoredTemplate,
  type TemplateContentInput,
  type TemplateMetadataInput,
} from "../src/lib/template-store";

const configuredStoragePath = process.env.TEMPLATE_STORAGE_FILE;
const STORAGE_FILE_PATH = configuredStoragePath
  ? path.resolve(configuredStoragePath)
  : path.resolve(process.cwd(), "storage", "templates.json");
const STORAGE_DIRECTORY = path.dirname(STORAGE_FILE_PATH);

export class TemplateRepositoryError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "TemplateRepositoryError";
    this.statusCode = statusCode;
  }
}

async function ensureStorageFile(): Promise<void> {
  await mkdir(STORAGE_DIRECTORY, { recursive: true });

  try {
    await access(STORAGE_FILE_PATH);
  } catch {
    await writeFile(STORAGE_FILE_PATH, "[]\n", "utf8");
  }
}

async function readTemplatesFromDisk(): Promise<StoredTemplate[]> {
  await ensureStorageFile();
  const raw = await readFile(STORAGE_FILE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sortTemplatesByUpdatedAt(parsed as StoredTemplate[]);
  } catch {
    return [];
  }
}

async function writeTemplatesToDisk(templates: StoredTemplate[]): Promise<void> {
  await ensureStorageFile();
  await writeFile(
    STORAGE_FILE_PATH,
    `${JSON.stringify(sortTemplatesByUpdatedAt(templates), null, 2)}\n`,
    "utf8",
  );
}

function assertMetadataInput(input: unknown): asserts input is TemplateMetadataInput {
  if (typeof input !== "object" || input === null) {
    throw new TemplateRepositoryError("Invalid template payload");
  }

  const candidate = input as Partial<TemplateMetadataInput>;
  const tagsAreValid = Array.isArray(candidate.tags) && candidate.tags.every((tag) => typeof tag === "string");

  if (
    typeof candidate.name !== "string"
    || typeof candidate.description !== "string"
    || typeof candidate.category !== "string"
    || typeof candidate.includeInExamples !== "boolean"
    || !tagsAreValid
  ) {
    throw new TemplateRepositoryError("Invalid template metadata payload");
  }
}

function assertContentInput(input: unknown): asserts input is TemplateContentInput {
  assertMetadataInput(input);

  const candidate = input as Partial<TemplateContentInput>;
  if (
    (candidate.format !== "yaml" && candidate.format !== "json")
    || typeof candidate.source !== "string"
  ) {
    throw new TemplateRepositoryError("Invalid template content payload");
  }
}

export async function listTemplates(): Promise<StoredTemplate[]> {
  return readTemplatesFromDisk();
}

export async function createTemplateRecord(input: unknown): Promise<StoredTemplate> {
  assertContentInput(input);

  const templates = await readTemplatesFromDisk();
  const createdTemplate = createStoredTemplate(input);
  const nextTemplates = [createdTemplate, ...templates];
  await writeTemplatesToDisk(nextTemplates);
  return createdTemplate;
}

export async function updateTemplateMetadataRecord(templateId: string, input: unknown): Promise<StoredTemplate> {
  assertMetadataInput(input);

  const templates = await readTemplatesFromDisk();
  const currentTemplate = templates.find((template) => template.id === templateId);

  if (!currentTemplate) {
    throw new TemplateRepositoryError("Template not found", 404);
  }

  const updatedTemplate = updateStoredTemplate(currentTemplate, input);
  await writeTemplatesToDisk(
    templates.map((template) => (template.id === templateId ? updatedTemplate : template)),
  );

  return updatedTemplate;
}

export async function overwriteTemplateRecord(templateId: string, input: unknown): Promise<StoredTemplate> {
  assertContentInput(input);

  const templates = await readTemplatesFromDisk();
  const currentTemplate = templates.find((template) => template.id === templateId);

  if (!currentTemplate) {
    throw new TemplateRepositoryError("Template not found", 404);
  }

  const updatedTemplate = updateStoredTemplate(currentTemplate, input);
  await writeTemplatesToDisk(
    templates.map((template) => (template.id === templateId ? updatedTemplate : template)),
  );

  return updatedTemplate;
}

export async function deleteTemplateRecord(templateId: string): Promise<void> {
  const templates = await readTemplatesFromDisk();
  const nextTemplates = templates.filter((template) => template.id !== templateId);

  if (nextTemplates.length === templates.length) {
    throw new TemplateRepositoryError("Template not found", 404);
  }

  await writeTemplatesToDisk(nextTemplates);
}
