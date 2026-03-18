export const SUPPORTED_COMPONENT_TYPES = [
  "window",
  "row",
  "column",
  "grid",
  "menu",
  "table",
  "input",
  "textarea",
  "select",
  "checkbox",
  "button",
  "label",
  "text",
  "modal",
  "card",
  "tabs",
] as const;

export type ComponentType = (typeof SUPPORTED_COMPONENT_TYPES)[number];

export const CONTAINER_COMPONENT_TYPES = [
  "window",
  "row",
  "column",
  "grid",
  "table",
  "modal",
  "card",
  "tabs",
] as const;

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

const VALID_TYPES = new Set<string>(SUPPORTED_COMPONENT_TYPES);

const CONTAINER_TYPES = new Set<string>(CONTAINER_COMPONENT_TYPES);

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateMenuNodeProps(props: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (props === undefined) {
    errors.push({ message: `${path}: "menu" requires a "props" object` });
    return errors;
  }

  if (!isObjectRecord(props)) {
    errors.push({ message: `${path}: "props" must be an object` });
    return errors;
  }

  const groups = props.groups;
  const items = props.items;

  if (groups === undefined && items === undefined) {
    errors.push({ message: `${path}: menu requires "groups" or "items"` });
    return errors;
  }

  const validateItem = (item: unknown, itemPath: string) => {
    if (!isObjectRecord(item)) {
      errors.push({ message: `${itemPath}: expected an object` });
      return;
    }

    if (typeof item.label !== "string" || item.label.trim().length === 0) {
      errors.push({ message: `${itemPath}: "label" must be a non-empty string` });
    }

    if (item.icon !== undefined && typeof item.icon !== "string") {
      errors.push({ message: `${itemPath}: "icon" must be a string` });
    }

    if (item.link !== undefined && typeof item.link !== "string") {
      errors.push({ message: `${itemPath}: "link" must be a string` });
    }

    if (item.active !== undefined && typeof item.active !== "boolean") {
      errors.push({ message: `${itemPath}: "active" must be a boolean` });
    }

    if (
      item.badge !== undefined
      && typeof item.badge !== "string"
      && typeof item.badge !== "number"
    ) {
      errors.push({ message: `${itemPath}: "badge" must be a string or number` });
    }
  };

  const validateGroup = (group: unknown, groupPath: string) => {
    if (!isObjectRecord(group)) {
      errors.push({ message: `${groupPath}: expected an object` });
      return;
    }

    if (group.title !== undefined && typeof group.title !== "string") {
      errors.push({ message: `${groupPath}: "title" must be a string` });
    }

    if (!Array.isArray(group.items)) {
      errors.push({ message: `${groupPath}: "items" must be an array` });
      return;
    }

    group.items.forEach((item, index) => validateItem(item, `${groupPath}.items[${index}]`));
  };

  if (groups !== undefined) {
    if (!Array.isArray(groups)) {
      errors.push({ message: `${path}: "groups" must be an array` });
    } else {
      groups.forEach((group, index) => validateGroup(group, `${path}.groups[${index}]`));
    }
  }

  if (items !== undefined) {
    if (!Array.isArray(items)) {
      errors.push({ message: `${path}: "items" must be an array` });
    } else {
      items.forEach((item, index) => validateItem(item, `${path}.items[${index}]`));
    }
  }

  return errors;
}

export function validateNode(node: unknown, path: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isObjectRecord(node)) {
    errors.push({ message: `${path}: expected an object` });
    return errors;
  }
  const obj = node;

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

  if (obj.type === "menu") {
    errors.push(...validateMenuNodeProps(obj.props, `${path}.props`));
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
