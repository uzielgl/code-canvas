export type ComponentType =
  | "window" | "row" | "column" | "grid" | "table"
  | "input" | "textarea" | "select" | "checkbox"
  | "button" | "label" | "text"
  | "modal" | "card" | "tabs";

export interface DslNode {
  type: ComponentType;
  id?: string;
  props?: Record<string, unknown>;
  children?: DslNode[];
}

export interface DslRoot {
  root: DslNode;
}

export interface ValidationError {
  line?: number;
  message: string;
}

export interface ParseResult {
  ast: DslRoot | null;
  errors: ValidationError[];
}

const VALID_TYPES = new Set<string>([
  "window", "row", "column", "grid", "table",
  "input", "textarea", "select", "checkbox",
  "button", "label", "text",
  "modal", "card", "tabs",
]);

const CONTAINER_TYPES = new Set<string>([
  "window", "row", "column", "grid", "table",
  "modal", "card", "tabs",
]);

export function validateNode(node: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    errors.push({ message: `${path}: expected an object` });
    return errors;
  }

  const obj = node as Record<string, unknown>;

  if (!obj.type || typeof obj.type !== "string") {
    errors.push({ message: `${path}: missing or invalid "type"` });
    return errors;
  }

  if (!VALID_TYPES.has(obj.type)) {
    errors.push({ message: `${path}: unknown type "${obj.type}". Valid: ${[...VALID_TYPES].join(", ")}` });
  }

  if (obj.props !== undefined && (typeof obj.props !== "object" || obj.props === null || Array.isArray(obj.props))) {
    errors.push({ message: `${path}: "props" must be an object` });
  }

  if (obj.children !== undefined) {
    if (!CONTAINER_TYPES.has(obj.type as string)) {
      errors.push({ message: `${path}: "${obj.type}" cannot have children` });
    } else if (!Array.isArray(obj.children)) {
      errors.push({ message: `${path}: "children" must be an array` });
    } else {
      (obj.children as unknown[]).forEach((child, i) => {
        errors.push(...validateNode(child, `${path}.children[${i}]`));
      });
    }
  }

  return errors;
}

export function validateDsl(parsed: unknown): ValidationError[] {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return [{ message: 'DSL root must be an object with a "root" key' }];
  }

  const obj = parsed as Record<string, unknown>;
  if (!obj.root) {
    return [{ message: 'Missing "root" key at top level' }];
  }

  return validateNode(obj.root, "root");
}
