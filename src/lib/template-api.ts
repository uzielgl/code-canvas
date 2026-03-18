import type { StoredTemplate, TemplateContentInput, TemplateMetadataInput } from "./template-store";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json() as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchTemplates(): Promise<StoredTemplate[]> {
  const response = await fetch("/api/templates");
  return parseResponse<StoredTemplate[]>(response);
}

export async function createTemplate(input: TemplateContentInput): Promise<StoredTemplate> {
  const response = await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<StoredTemplate>(response);
}

export async function updateTemplateMetadata(
  templateId: string,
  input: TemplateMetadataInput,
): Promise<StoredTemplate> {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<StoredTemplate>(response);
}

export async function overwriteTemplate(
  templateId: string,
  input: TemplateContentInput,
): Promise<StoredTemplate> {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<StoredTemplate>(response);
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: "DELETE",
  });

  await parseResponse<void>(response);
}
