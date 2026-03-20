interface ApiErrorBody {
  message?: string;
}

export interface TerminalSessionSummary {
  id: string;
  cwd: string;
}

interface TerminalEventPayload {
  type: "ready" | "output" | "status" | "closed" | "heartbeat";
  cwd?: string;
  data?: string;
  status?: "idle" | "running";
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json() as ApiErrorBody;
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

export async function createTerminalSession(): Promise<TerminalSessionSummary> {
  const response = await fetch("/api/terminal/sessions", {
    method: "POST",
  });

  return parseResponse<TerminalSessionSummary>(response);
}

export async function sendTerminalInput(sessionId: string, input: string): Promise<void> {
  const response = await fetch(`/api/terminal/sessions/${sessionId}/input`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });

  await parseResponse<void>(response);
}

export async function closeTerminalSession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/terminal/sessions/${sessionId}`, {
    method: "DELETE",
  });

  await parseResponse<void>(response);
}

interface TerminalStreamHandlers {
  onReady?: (cwd?: string) => void;
  onOutput?: (data: string) => void;
  onStatus?: (status: "idle" | "running") => void;
  onClosed?: () => void;
  onError?: (error: Error) => void;
}

export function subscribeToTerminalSession(
  sessionId: string,
  handlers: TerminalStreamHandlers,
): () => void {
  const source = new EventSource(`/api/terminal/sessions/${sessionId}/stream`);

  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as TerminalEventPayload;

      switch (payload.type) {
        case "ready":
          handlers.onReady?.(payload.cwd);
          break;
        case "output":
          if (payload.data) {
            handlers.onOutput?.(payload.data);
          }
          break;
        case "status":
          if (payload.status) {
            handlers.onStatus?.(payload.status);
          }
          break;
        case "closed":
          handlers.onClosed?.();
          source.close();
          break;
        case "heartbeat":
          break;
        default:
          break;
      }
    } catch (error) {
      handlers.onError?.(error instanceof Error ? error : new Error("Failed to parse terminal event"));
    }
  };

  source.onerror = () => {
    handlers.onError?.(new Error("Lost connection to the local AI terminal"));
  };

  return () => {
    source.close();
  };
}
