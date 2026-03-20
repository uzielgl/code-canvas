import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, SquareTerminal, X } from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  closeTerminalSession,
  createTerminalSession,
  sendTerminalInput,
  subscribeToTerminalSession,
} from "@/lib/terminal-api";

type TerminalStatus = "idle" | "starting" | "connecting" | "running" | "error";

interface AITerminalPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabelMap: Record<TerminalStatus, string> = {
  idle: "Idle",
  starting: "Starting",
  connecting: "Connecting",
  running: "Running",
  error: "Error",
};

const AITerminalPanel: React.FC<AITerminalPanelProps> = ({ open, onOpenChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const creatingSessionRef = useRef(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [cwd, setCwd] = useState<string | null>(null);
  const [status, setStatus] = useState<TerminalStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (!open || !containerRef.current || terminalRef.current) {
      return;
    }

    const terminal = new Terminal({
      convertEol: true,
      disableStdin: true,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 13,
      scrollback: 4_000,
      theme: {
        background: "#020617",
        foreground: "#e2e8f0",
        cursor: "#3b82f6",
        cursorAccent: "#020617",
        selectionBackground: "rgba(59,130,246,0.28)",
      },
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(containerRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    return () => {
      resizeObserver.disconnect();
      fitAddonRef.current = null;
      terminalRef.current?.dispose();
      terminalRef.current = null;
    };
  }, [open]);

  const shutdownSession = useCallback(async () => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;

    const activeSessionId = sessionIdRef.current;
    sessionIdRef.current = null;
    setSessionId(null);
    setCwd(null);

    if (activeSessionId) {
      try {
        await closeTerminalSession(activeSessionId);
      } catch {
        // Ignore cleanup failures when the local session is already gone.
      }
    }

    setStatus("idle");
    setErrorMessage(null);
    terminalRef.current?.clear();
  }, []);

  useEffect(() => {
    if (open || (!sessionIdRef.current && !unsubscribeRef.current)) {
      return;
    }

    void shutdownSession();
  }, [open, shutdownSession]);

  useEffect(() => {
    if (!open || sessionId || creatingSessionRef.current) {
      return;
    }

    let cancelled = false;
    creatingSessionRef.current = true;
    setStatus("starting");
    setErrorMessage(null);

    terminalRef.current?.clear();
    terminalRef.current?.writeln("\x1b[36mOpening local AI console...\x1b[0m");

    void createTerminalSession()
      .then((session) => {
        if (cancelled) {
          void closeTerminalSession(session.id);
          return;
        }

        setSessionId(session.id);
        setCwd(session.cwd);
        setStatus("connecting");
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Failed to start the AI terminal");
        terminalRef.current?.writeln("\x1b[31mFailed to start the local AI console.\x1b[0m");
      })
      .finally(() => {
        creatingSessionRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [open, sessionId]);

  useEffect(() => {
    if (!open || !sessionId || !terminalRef.current) {
      return;
    }

    setStatus("connecting");
    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribeToTerminalSession(sessionId, {
      onReady: (nextCwd) => {
        if (nextCwd) {
          setCwd(nextCwd);
        }
        setStatus("idle");
        fitAddonRef.current?.fit();
      },
      onOutput: (chunk) => {
        terminalRef.current?.write(chunk);
      },
      onStatus: (nextStatus) => {
        setStatus(nextStatus === "running" ? "running" : "idle");
      },
      onClosed: () => {
        setStatus("idle");
      },
      onError: (error) => {
        setStatus("error");
        setErrorMessage(error.message);
      },
    });

    return () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [open, sessionId]);

  const handleSubmit = () => {
    const activeSessionId = sessionIdRef.current;
    const trimmedPrompt = prompt.trim();

    if (!activeSessionId || !trimmedPrompt || status === "running") {
      return;
    }

    setErrorMessage(null);
    void sendTerminalInput(activeSessionId, trimmedPrompt)
      .then(() => {
        setPrompt("");
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Failed to run local Codex");
        setStatus("error");
      });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end">
      <div className="pointer-events-auto flex h-[min(34rem,72vh)] w-[min(72rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_32px_90px_-28px_rgba(2,6,23,0.9)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950/95 px-4 py-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Bot className="h-4 w-4 text-sky-400" />
              AI Terminal
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-300">
                {statusLabelMap[status]}
              </span>
            </div>
            <div className="truncate text-xs text-slate-400">
              {cwd ?? "Launching local Codex inside this project..."}
            </div>
            {errorMessage ? (
              <div className="text-xs text-rose-300">{errorMessage}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {status === "starting" || status === "connecting" || status === "running" ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <SquareTerminal className="h-4 w-4 text-slate-500" />
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => onOpenChange(false)}
              aria-label="Close AI terminal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="min-h-0 flex-1 bg-slate-950 px-2 py-2" />

        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-3">
          <div className="flex items-center gap-2">
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSubmit();
                }
              }}
              className="h-10 border-slate-700 bg-slate-900 text-sm text-slate-100 placeholder:text-slate-500"
              placeholder="Ask Codex about this project..."
              disabled={status === "starting" || status === "connecting" || status === "running"}
            />
            <Button
              type="button"
              className="h-10 shrink-0"
              onClick={handleSubmit}
              disabled={!prompt.trim() || status === "starting" || status === "connecting" || status === "running"}
            >
              {status === "running" ? "Running..." : "Run"}
            </Button>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Runs local `codex exec` inside the current project and streams the result into this panel.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITerminalPanel;
