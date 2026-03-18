import type { IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import type { Plugin } from "vite";
import {
  TemplateRepositoryError,
  createTemplateRecord,
  deleteTemplateRecord,
  listTemplates,
  overwriteTemplateRecord,
  updateTemplateMetadataRecord,
} from "./template-repository";

type NextFunction = (error?: unknown) => void;

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new TemplateRepositoryError("Request body must be valid JSON");
  }
}

async function handleTemplateRequest(
  request: IncomingMessage,
  response: ServerResponse,
  next: NextFunction,
): Promise<void> {
  if (!request.url) {
    next();
    return;
  }

  const requestUrl = new URL(request.url, "http://localhost");
  if (!requestUrl.pathname.startsWith("/api/templates")) {
    next();
    return;
  }

  try {
    const pathParts = requestUrl.pathname.split("/").filter(Boolean);
    const templateId = pathParts[2];

    if (request.method === "GET" && requestUrl.pathname === "/api/templates") {
      sendJson(response, 200, await listTemplates());
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/templates") {
      sendJson(response, 201, await createTemplateRecord(await readJsonBody(request)));
      return;
    }

    if (templateId && request.method === "PATCH") {
      sendJson(response, 200, await updateTemplateMetadataRecord(templateId, await readJsonBody(request)));
      return;
    }

    if (templateId && request.method === "PUT") {
      sendJson(response, 200, await overwriteTemplateRecord(templateId, await readJsonBody(request)));
      return;
    }

    if (templateId && request.method === "DELETE") {
      await deleteTemplateRecord(templateId);
      response.statusCode = 204;
      response.end();
      return;
    }

    sendJson(response, 405, { message: "Method not allowed" });
  } catch (error) {
    if (error instanceof TemplateRepositoryError) {
      sendJson(response, error.statusCode, { message: error.message });
      return;
    }

    sendJson(response, 500, { message: "Unexpected server error" });
  }
}

export function templateApiPlugin(): Plugin {
  return {
    name: "template-api-plugin",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleTemplateRequest(request, response, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        void handleTemplateRequest(request, response, next);
      });
    },
  };
}
