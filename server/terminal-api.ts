import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { URL } from "node:url";
import { TemplateRepositoryError } from "./template-repository";

type NextFunction = (error?: unknown) => void;

interface TerminalSession {
  id: string;
  cwd: string;
  clients: Set<ServerResponse>;
  backlog: string[];
  backlogBytes: number;
  cleanupTimer: NodeJS.Timeout | null;
  activeRun: ChildProcessWithoutNullStreams | null;
  partialLine: string;
}

const MAX_BACKLOG_BYTES = 256 * 1024;
const SESSION_RETENTION_MS = 10 * 60_000;
const HEARTBEAT_MS = 15_000;
const sessions = new Map<string, TerminalSession>();

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

function sendSse(response: ServerResponse, payload: unknown): void {
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function getCleanEnvironment(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function appendBacklog(session: TerminalSession, chunk: string): void {
  session.backlog.push(chunk);
  session.backlogBytes += Buffer.byteLength(chunk, "utf8");

  while (session.backlogBytes > MAX_BACKLOG_BYTES && session.backlog.length > 0) {
    const removed = session.backlog.shift();
    if (!removed) {
      break;
    }

    session.backlogBytes -= Buffer.byteLength(removed, "utf8");
  }
}

function broadcastOutput(session: TerminalSession, chunk: string): void {
  appendBacklog(session, chunk);
  session.clients.forEach((client) => {
    sendSse(client, { type: "output", data: chunk });
  });
}

function scheduleSessionCleanup(session: TerminalSession): void {
  if (session.cleanupTimer) {
    clearTimeout(session.cleanupTimer);
  }

  session.cleanupTimer = setTimeout(() => {
    if (session.clients.size === 0 && !session.activeRun) {
      sessions.delete(session.id);
    }
  }, SESSION_RETENTION_MS);
}

function broadcastStatus(session: TerminalSession, status: "idle" | "running"): void {
  session.clients.forEach((client) => {
    sendSse(client, { type: "status", status });
  });
}

function destroySession(session: TerminalSession): void {
  if (session.activeRun && !session.activeRun.killed) {
    session.activeRun.kill("SIGTERM");
  }

  if (session.cleanupTimer) {
    clearTimeout(session.cleanupTimer);
    session.cleanupTimer = null;
  }

  session.clients.forEach((client) => {
    sendSse(client, { type: "closed" });
    client.end();
  });
  session.clients.clear();
  sessions.delete(session.id);
}

function createSession(): TerminalSession {
  const session: TerminalSession = {
    id: randomUUID(),
    cwd: process.cwd(),
    clients: new Set(),
    backlog: [
      "Connected to local Codex in this project.\r\n",
      "Send a prompt below and the app will run `codex exec` from the workspace root.\r\n\r\n",
    ],
    backlogBytes: 0,
    cleanupTimer: null,
    activeRun: null,
    partialLine: "",
  };

  session.backlog.forEach((chunk) => {
    session.backlogBytes += Buffer.byteLength(chunk, "utf8");
  });
  sessions.set(session.id, session);

  return session;
}

function getSessionOrThrow(sessionId: string): TerminalSession {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new TemplateRepositoryError("AI session not found", 404);
  }

  return session;
}

function formatJsonEvent(line: string): string | null {
  if (!line.trim()) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}T.*\bWARN\b/.test(line)) {
    return null;
  }

  try {
    const payload = JSON.parse(line) as {
      type?: string;
      item?: { type?: string; text?: string };
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    if (payload.type === "item.completed" && payload.item?.type === "agent_message") {
      return `${payload.item.text ?? ""}\r\n`;
    }

    if (payload.type === "turn.completed") {
      const inputTokens = payload.usage?.input_tokens;
      const outputTokens = payload.usage?.output_tokens;
      return `\r\n[done${inputTokens != null && outputTokens != null ? ` · ${inputTokens} in / ${outputTokens} out` : ""}]\r\n\r\n`;
    }

    return null;
  } catch {
    return `${line}\r\n`;
  }
}

function handleProcessChunk(session: TerminalSession, rawChunk: string): void {
  session.partialLine += rawChunk.replace(/\r\n/g, "\n");
  const lines = session.partialLine.split("\n");
  session.partialLine = lines.pop() ?? "";

  lines.forEach((line) => {
    const formatted = formatJsonEvent(line);
    if (formatted) {
      broadcastOutput(session, formatted);
    }
  });
}

function startPromptRun(session: TerminalSession, prompt: string): void {
  if (session.activeRun) {
    throw new TemplateRepositoryError("Codex is already processing another prompt", 409);
  }

  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new TemplateRepositoryError("Prompt is required");
  }

  broadcastOutput(session, `> ${trimmedPrompt}\r\n\r\n`);
  broadcastStatus(session, "running");

  const child = spawn(
    "codex",
    [
      "exec",
      "--json",
      "--skip-git-repo-check",
      trimmedPrompt,
    ],
    {
      cwd: session.cwd,
      env: getCleanEnvironment(),
    },
  );

  session.activeRun = child;
  session.partialLine = "";

  const handleStream = (chunk: Buffer) => {
    handleProcessChunk(session, chunk.toString("utf8"));
  };

  child.stdout.on("data", handleStream);
  child.stderr.on("data", handleStream);
  child.on("close", (code, signal) => {
    if (session.partialLine.trim()) {
      const formatted = formatJsonEvent(session.partialLine.trim());
      if (formatted) {
        broadcastOutput(session, formatted);
      }
    }
    session.partialLine = "";
    session.activeRun = null;
    broadcastStatus(session, "idle");

    if (code && code !== 0) {
      broadcastOutput(session, `[process exited with code ${code}${signal ? ` / ${signal}` : ""}]\r\n\r\n`);
    }

    if (session.clients.size === 0) {
      scheduleSessionCleanup(session);
    }
  });
}

export async function handleTerminalRequest(
  request: IncomingMessage,
  response: ServerResponse,
  next: NextFunction,
): Promise<void> {
  if (!request.url) {
    next();
    return;
  }

  const requestUrl = new URL(request.url, "http://localhost");
  if (!requestUrl.pathname.startsWith("/api/terminal")) {
    next();
    return;
  }

  try {
    const pathParts = requestUrl.pathname.split("/").filter(Boolean);
    const sessionId = pathParts[3];
    const action = pathParts[4];

    if (request.method === "POST" && requestUrl.pathname === "/api/terminal/sessions") {
      const session = createSession();
      sendJson(response, 201, { id: session.id, cwd: session.cwd });
      return;
    }

    if (!sessionId) {
      sendJson(response, 404, { message: "AI session not found" });
      return;
    }

    const session = getSessionOrThrow(sessionId);

    if (request.method === "GET" && action === "stream") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "text/event-stream");
      response.setHeader("Cache-Control", "no-cache, no-transform");
      response.setHeader("Connection", "keep-alive");
      response.setHeader("X-Accel-Buffering", "no");
      response.flushHeaders?.();

      if (session.cleanupTimer) {
        clearTimeout(session.cleanupTimer);
        session.cleanupTimer = null;
      }

      session.clients.add(response);
      sendSse(response, { type: "ready", cwd: session.cwd });
      sendSse(response, { type: "status", status: session.activeRun ? "running" : "idle" });
      session.backlog.forEach((chunk) => {
        sendSse(response, { type: "output", data: chunk });
      });

      const heartbeat = setInterval(() => {
        sendSse(response, { type: "heartbeat" });
      }, HEARTBEAT_MS);

      request.on("close", () => {
        clearInterval(heartbeat);
        session.clients.delete(response);
        if (!session.activeRun && session.clients.size === 0) {
          scheduleSessionCleanup(session);
        }
      });

      return;
    }

    if (request.method === "POST" && action === "input") {
      const body = await readJsonBody(request) as { input?: string };
      if (typeof body.input !== "string") {
        throw new TemplateRepositoryError("Input must be a string");
      }

      startPromptRun(session, body.input);
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "DELETE" && pathParts.length === 4) {
      destroySession(session);
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

    sendJson(response, 500, { message: "Unexpected AI server error" });
  }
}
