import React, { useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FolderKanban,
  Home,
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingBag,
  Tag,
  Ticket,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { DslNode } from "@/lib/dsl-schema";

interface RendererProps {
  node: DslNode;
  mode: "wireframe" | "ui";
  onActivateLink?: (reference: string) => void;
}

interface MenuItemConfig {
  label: string;
  icon?: string;
  active?: boolean;
  badge?: string | number;
  link?: string;
}

interface MenuGroupConfig {
  title?: string;
  items: MenuItemConfig[];
}

const wire = (mode: string) => mode === "wireframe";

const menuIcons: Record<string, LucideIcon> = {
  home: Home,
  dashboard: LayoutDashboard,
  business: Briefcase,
  company: Building2,
  users: Users,
  user: UserRound,
  categories: Shapes,
  category: Tag,
  products: Package,
  orders: ShoppingBag,
  templates: FolderKanban,
  tickets: Ticket,
  features: Wrench,
  calendar: CalendarDays,
  hr: BadgeCheck,
  handbook: BookOpen,
};

function isExternalLink(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

function triggerLink(link: string | undefined, onActivateLink?: (reference: string) => void): void {
  if (!link) {
    return;
  }

  if (isExternalLink(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }

  onActivateLink?.(link);
}

function getNodeLink(props: Record<string, unknown>): string | undefined {
  if (typeof props.link === "string") {
    return props.link;
  }

  if (typeof props.href === "string") {
    return props.href;
  }

  if (typeof props.template === "string") {
    return props.template;
  }

  return undefined;
}

function getInteractiveProps(
  link: string | undefined,
  onActivateLink: RendererProps["onActivateLink"],
  baseClassName: string,
  clickableClassName: string,
) {
  if (!link) {
    return {
      className: baseClassName,
    };
  }

  return {
    className: `${baseClassName} ${clickableClassName}`,
    onClick: () => triggerLink(link, onActivateLink),
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        triggerLink(link, onActivateLink);
      }
    },
  };
}

function normalizeMenuGroups(props: Record<string, unknown>): MenuGroupConfig[] {
  const directItems = Array.isArray(props.items)
    ? [{ items: props.items }]
    : [];
  const configuredGroups = Array.isArray(props.groups)
    ? props.groups
    : directItems;

  return configuredGroups
    .map((group) => {
      if (typeof group !== "object" || group === null || Array.isArray(group)) {
        return null;
      }

      const title = typeof group.title === "string" ? group.title : undefined;
      const items = Array.isArray(group.items)
        ? group.items
          .map((item) => {
            if (typeof item !== "object" || item === null || Array.isArray(item)) {
              return null;
            }

            return {
              label: String(item.label ?? "Menu Item"),
              icon: typeof item.icon === "string" ? item.icon : undefined,
              active: item.active === true,
              badge: typeof item.badge === "string" || typeof item.badge === "number" ? item.badge : undefined,
              link: typeof item.link === "string" ? item.link : undefined,
            } satisfies MenuItemConfig;
          })
          .filter((item): item is MenuItemConfig => item !== null)
        : [];

      return { title, items };
    })
    .filter((group): group is MenuGroupConfig => group !== null && group.items.length > 0);
}

function getMenuIcon(iconName?: string): LucideIcon {
  if (!iconName) {
    return LayoutDashboard;
  }

  return menuIcons[iconName.toLowerCase()] ?? LayoutDashboard;
}

const TabsRenderer: React.FC<RendererProps> = ({ node, mode, onActivateLink }) => {
  const w = wire(mode);
  const p = node.props ?? {};
  const tabLabels = Array.isArray(p.tabs) ? p.tabs.map(String) : ["Tab 1", "Tab 2"];
  const children = node.children ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const boundedIndex = Math.min(activeIndex, Math.max(children.length - 1, 0), Math.max(tabLabels.length - 1, 0));

  return (
    <div className="space-y-2">
      <div className={`flex gap-0 ${w ? "border-b border-wire-stroke" : "border-b border-border"}`}>
        {tabLabels.map((tab, index) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={w
              ? `px-3 py-1 font-mono text-xs ${boundedIndex === index ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"}`
              : `px-4 py-2 text-sm ${boundedIndex === index ? "border-b-2 border-primary font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            {tab}
          </button>
        ))}
      </div>
      {children[boundedIndex] && <NodeRenderer node={children[boundedIndex]} mode={mode} onActivateLink={onActivateLink} />}
    </div>
  );
};

const MenuRenderer: React.FC<RendererProps> = ({ node, mode, onActivateLink }) => {
  const w = wire(mode);
  const groups = normalizeMenuGroups(node.props ?? {});

  return (
    <div className={w
      ? "border border-wire-stroke p-3 space-y-4 min-w-[220px]"
      : "rounded-2xl border border-border bg-background p-4 space-y-5 min-w-[260px] shadow-sm"
    }>
      {groups.map((group, groupIndex) => (
        <div key={`${group.title ?? "group"}-${groupIndex}`} className="space-y-2">
          {group.title && (
            <div className={w
              ? "font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
              : "flex items-center justify-between text-xs font-medium text-muted-foreground"
            }>
              <span>{group.title}</span>
              {!w && <span>⌃</span>}
            </div>
          )}

          <div className="space-y-1">
            {group.items.map((item, itemIndex) => {
              const Icon = getMenuIcon(item.icon);
              const className = w
                ? `flex items-center justify-between gap-3 border px-2 py-1.5 ${item.active ? "border-foreground bg-muted/40" : "border-wire-stroke"}`
                : `flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors ${item.active ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted/50"}`;

              const interactiveProps = getInteractiveProps(
                item.link,
                onActivateLink,
                className,
                "cursor-pointer",
              );

              return (
                <div key={`${item.label}-${itemIndex}`} {...interactiveProps}>
                  <div className="flex items-center gap-3 min-w-0">
                    {w ? (
                      <div className="font-mono text-[10px] text-muted-foreground">[{item.icon ?? "icon"}]</div>
                    ) : (
                      <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                    <span className={w
                      ? "font-mono text-xs truncate"
                      : `text-sm truncate ${item.active ? "font-medium" : "font-normal"}`
                    }>
                      {item.label}
                    </span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={w
                      ? "border border-wire-stroke px-1.5 py-0.5 font-mono text-[10px]"
                      : "inline-flex min-w-8 items-center justify-center rounded-lg border border-primary/15 bg-primary/5 px-2 py-1 text-xs font-medium text-primary"
                    }>
                      {String(item.badge)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const NodeRenderer: React.FC<RendererProps> = ({ node, mode, onActivateLink }) => {
  const p = node.props ?? {};
  const w = wire(mode);
  const nodeLink = getNodeLink(p);

  const renderChildren = () =>
    node.children?.map((child, i) => (
      <NodeRenderer key={child.id ?? i} node={child} mode={mode} onActivateLink={onActivateLink} />
    ));

  switch (node.type) {
    case "window": {
      const baseClassName = w
        ? "border border-wire-stroke p-4 space-y-3 bg-wire-bg min-h-[200px]"
        : "border border-border rounded-lg p-5 space-y-4 bg-background shadow-sm min-h-[200px]";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");

      return (
        <div {...interactiveProps}>
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
    }

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
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {renderChildren()}
        </div>
      );
    }

    case "menu":
      return <MenuRenderer node={node} mode={mode} onActivateLink={onActivateLink} />;

    case "card": {
      const baseClassName = w
        ? "border border-wire-stroke p-3 space-y-2"
        : "border border-border rounded-lg p-4 space-y-3 bg-card shadow-sm";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");

      return (
        <div {...interactiveProps}>
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
    }

    case "label": {
      const baseClassName = w
        ? "font-mono text-xs text-foreground"
        : "text-sm font-medium text-foreground";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");
      return <label {...interactiveProps}>{String(p.text ?? "Label")}</label>;
    }

    case "text": {
      const baseClassName = w
        ? "font-mono text-xs text-muted-foreground"
        : "text-sm text-muted-foreground";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");
      return <p {...interactiveProps}>{String(p.content ?? "")}</p>;
    }

    case "input": {
      const interactiveProps = getInteractiveProps(
        nodeLink,
        onActivateLink,
        w
          ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full"
          : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring",
        "cursor-pointer",
      );

      return (
        <input
          type={String(p.inputType ?? "text")}
          placeholder={String(p.placeholder ?? "")}
          {...interactiveProps}
        />
      );
    }

    case "textarea": {
      const interactiveProps = getInteractiveProps(
        nodeLink,
        onActivateLink,
        w
          ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full resize-none"
          : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full resize-none focus:outline-none focus:ring-2 focus:ring-ring",
        "cursor-pointer",
      );

      return (
        <textarea
          placeholder={String(p.placeholder ?? "")}
          rows={Number(p.rows) || 3}
          {...interactiveProps}
        />
      );
    }

    case "select": {
      const options = Array.isArray(p.options) ? p.options : ["Option 1", "Option 2"];
      const interactiveProps = getInteractiveProps(
        nodeLink,
        onActivateLink,
        w
          ? "border border-wire-stroke bg-transparent px-2 py-1 font-mono text-xs w-full"
          : "border border-input rounded-md bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring",
        "cursor-pointer",
      );

      return (
        <select {...interactiveProps}>
          {options.map((opt, i) => (
            <option key={i}>{String(opt)}</option>
          ))}
        </select>
      );
    }

    case "checkbox": {
      const baseClassName = `flex items-center gap-2 ${w ? "font-mono text-xs" : "text-sm"}`;
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");

      return (
        <label {...interactiveProps}>
          <input
            type="checkbox"
            defaultChecked={Boolean(p.checked)}
            className={w
              ? "border border-wire-stroke h-3 w-3"
              : "h-4 w-4 rounded border-input text-primary"
            }
          />
          {String(p.label ?? "Checkbox")}
        </label>
      );
    }

    case "button": {
      const variant = String(p.variant ?? "default");
      const isPrimary = variant === "primary";
      const interactiveProps = getInteractiveProps(
        nodeLink,
        onActivateLink,
        w
          ? "border border-wire-stroke px-3 py-1 font-mono text-xs"
          : isPrimary
            ? "bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            : "border border-input bg-background rounded-md px-4 py-2 text-sm font-medium hover:bg-accent",
        nodeLink ? "cursor-pointer" : "",
      );

      return (
        <button type="button" {...interactiveProps}>
          {String(p.text ?? "Button")}
        </button>
      );
    }

    case "table": {
      const columns = Array.isArray(p.columns) ? p.columns.map(String) : ["Col 1", "Col 2"];
      const rows = Array.isArray(p.rows) ? p.rows : [];
      const baseClassName = w ? "border border-wire-stroke" : "border border-border rounded-lg overflow-hidden";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");

      return (
        <div {...interactiveProps}>
          <table className="w-full text-left">
            <thead>
              <tr className={w ? "border-b border-wire-stroke" : "border-b border-border bg-muted"}>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={w
                      ? "px-2 py-1 font-mono text-xs font-semibold"
                      : "px-4 py-2 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={w ? "border-b border-wire-stroke last:border-0" : "border-b border-border last:border-0"}>
                  {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                    <td key={ci} className={w ? "px-2 py-1 font-mono text-xs" : "px-4 py-2 text-sm"}>
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "modal": {
      const baseClassName = w
        ? "border-2 border-dashed border-wire-stroke p-3 space-y-2 mt-2"
        : "border border-border rounded-lg p-5 space-y-3 bg-card shadow-lg mt-2";
      const interactiveProps = getInteractiveProps(nodeLink, onActivateLink, baseClassName, "cursor-pointer");

      return (
        <div {...interactiveProps}>
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
    }

    case "tabs":
      return <TabsRenderer node={node} mode={mode} onActivateLink={onActivateLink} />;

    default:
      return (
        <div className="text-destructive font-mono text-xs p-1 border border-destructive">
          Unknown: {node.type}
        </div>
      );
  }
};

export default NodeRenderer;
