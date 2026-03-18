import React from "react";
import type { DslNode } from "@/lib/dsl-schema";

interface RendererProps {
  node: DslNode;
  mode: "wireframe" | "ui";
}

const wire = (mode: string) => mode === "wireframe";

const WireframeImagePlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center border border-wire-stroke bg-wire-bg text-wire-stroke font-mono text-xs ${className ?? "h-16 w-full"}`}>
    ✕ image
  </div>
);

const NodeRenderer: React.FC<RendererProps> = ({ node, mode }) => {
  const p = node.props ?? {};
  const w = wire(mode);

  const renderChildren = () =>
    node.children?.map((child, i) => (
      <NodeRenderer key={child.id ?? i} node={child} mode={mode} />
    ));

  switch (node.type) {
    case "window":
      return (
        <div className={w
          ? "border border-wire-stroke p-4 space-y-3 bg-wire-bg min-h-[200px]"
          : "border border-border rounded-lg p-5 space-y-4 bg-background shadow-sm min-h-[200px]"
        }>
          {p.title && (
            <div className={w
              ? "font-mono text-sm font-semibold text-foreground border-b border-wire-stroke pb-2 mb-2"
              : "text-base font-semibold text-foreground border-b border-border pb-3 mb-3"
            }>
              {String(p.title)}
            </div>
          )}
          {renderChildren()}
        </div>
      );

    case "row":
      return (
        <div className={`flex gap-${w ? "2" : "3"} items-start flex-wrap`}>
          {renderChildren()}
        </div>
      );

    case "column":
      return (
        <div className={`flex flex-col gap-${w ? "2" : "3"} flex-1 min-w-0`}>
          {renderChildren()}
        </div>
      );

    case "grid": {
      const cols = Number(p.columns) || 2;
      return (
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {renderChildren()}
        </div>
      );
    }

    case "card":
      return (
        <div className={w
          ? "border border-wire-stroke p-3 space-y-2"
          : "border border-border rounded-lg p-4 space-y-3 bg-card shadow-sm"
        }>
          {p.title && (
            <div className={w
              ? "font-mono text-xs font-semibold text-foreground border-b border-wire-stroke pb-1"
              : "text-sm font-semibold text-foreground border-b border-border pb-2"
            }>
              {String(p.title)}
            </div>
          )}
          {renderChildren()}
        </div>
      );

    case "label":
      return (
        <label className={w
          ? "font-mono text-xs text-foreground"
          : "text-sm font-medium text-foreground"
        }>
          {String(p.text ?? "Label")}
        </label>
      );

    case "text":
      return (
        <p className={w
          ? "font-mono text-xs text-muted-foreground"
          : "text-sm text-muted-foreground"
        }>
          {String(p.content ?? "")}
        </p>
      );

    case "input":
      return (
        <input
          type={String(p.inputType ?? "text")}
          placeholder={String(p.placeholder ?? "")}
          readOnly
          className={w
            ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full"
            : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
          }
        />
      );

    case "textarea":
      return (
        <textarea
          placeholder={String(p.placeholder ?? "")}
          readOnly
          rows={Number(p.rows) || 3}
          className={w
            ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full resize-none"
            : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          }
        />
      );

    case "select": {
      const options = Array.isArray(p.options) ? p.options : ["Option 1", "Option 2"];
      return (
        <select
          className={w
            ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full"
            : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
          }
        >
          {options.map((opt, i) => (
            <option key={i}>{String(opt)}</option>
          ))}
        </select>
      );
    }

    case "checkbox":
      return (
        <label className={`flex items-center gap-2 ${w ? "font-mono text-xs" : "text-sm"}`}>
          <input type="checkbox" readOnly className={w
            ? "border border-wire-stroke h-3 w-3"
            : "h-4 w-4 rounded border-input text-primary"
          } />
          {String(p.label ?? "Checkbox")}
        </label>
      );

    case "button": {
      const variant = String(p.variant ?? "default");
      const isPrimary = variant === "primary";
      return (
        <button className={w
          ? "border border-wire-stroke px-3 py-1 font-mono text-xs"
          : isPrimary
            ? "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            : "border border-input bg-background rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
        }>
          {String(p.text ?? "Button")}
        </button>
      );
    }

    case "table": {
      const columns = Array.isArray(p.columns) ? p.columns.map(String) : ["Col 1", "Col 2"];
      const rows = Array.isArray(p.rows) ? p.rows : [];
      return (
        <div className={w ? "border border-wire-stroke" : "border border-border rounded-lg overflow-hidden"}>
          <table className="w-full text-left">
            <thead>
              <tr className={w ? "border-b border-wire-stroke" : "border-b border-border bg-muted"}>
                {columns.map((col, i) => (
                  <th key={i} className={w
                    ? "px-2 py-1 font-mono text-xs font-semibold"
                    : "px-4 py-2 text-xs font-semibold text-muted-foreground"
                  }>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={w ? "border-b border-wire-stroke last:border-0" : "border-b border-border last:border-0"}>
                  {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                    <td key={ci} className={w
                      ? "px-2 py-1 font-mono text-xs"
                      : "px-4 py-2 text-sm"
                    }>{String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "modal":
      return (
        <div className={w
          ? "border-2 border-dashed border-wire-stroke p-3 space-y-2 mt-2"
          : "border border-border rounded-lg p-5 space-y-3 bg-card shadow-lg mt-2"
        }>
          <div className={w
            ? "font-mono text-xs font-semibold text-foreground flex justify-between items-center border-b border-wire-stroke pb-1"
            : "text-sm font-semibold text-foreground flex justify-between items-center border-b border-border pb-2"
          }>
            <span>{String(p.title ?? "Modal")}</span>
            <span className="text-muted-foreground cursor-pointer">✕</span>
          </div>
          {renderChildren()}
        </div>
      );

    case "tabs": {
      const tabLabels = Array.isArray(p.tabs) ? p.tabs.map(String) : ["Tab 1", "Tab 2"];
      const children = node.children ?? [];
      return (
        <div className="space-y-2">
          <div className={`flex gap-0 ${w ? "border-b border-wire-stroke" : "border-b border-border"}`}>
            {tabLabels.map((tab, i) => (
              <button
                key={i}
                className={w
                  ? `px-3 py-1 font-mono text-xs ${i === 0 ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"}`
                  : `px-4 py-2 text-sm ${i === 0 ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {tab}
              </button>
            ))}
          </div>
          {children[0] && <NodeRenderer node={children[0]} mode={mode} />}
        </div>
      );
    }

    default:
      return (
        <div className="text-destructive font-mono text-xs p-1 border border-destructive">
          Unknown: {node.type}
        </div>
      );
  }
};

export default NodeRenderer;
