import yaml from "js-yaml";
import { type DslRoot, type ParseResult, type ValidationError, validateDsl } from "./dsl-schema";

export type DslFormat = "yaml" | "json";

export const DSL_FORMAT_LABELS: Record<DslFormat, string> = {
  yaml: "WireframeDSL",
  json: "JSON",
};

function getJsonErrorLine(source: string, message: string): number | undefined {
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (!positionMatch) {
    return undefined;
  }

  const position = Number(positionMatch[1]);
  if (Number.isNaN(position) || position < 0) {
    return undefined;
  }

  return source.slice(0, position).split("\n").length;
}

function parseStructuredSource(source: string, format: DslFormat): { parsed: unknown; errors: ValidationError[] } {
  try {
    if (format === "json") {
      return { parsed: JSON.parse(source), errors: [] };
    }

    return { parsed: yaml.load(source), errors: [] };
  } catch (error: unknown) {
    if (format === "json") {
      const message = error instanceof Error ? error.message : "JSON parse error";
      return {
        parsed: null,
        errors: [{
          line: getJsonErrorLine(source, message),
          message,
        }],
      };
    }

    const yamlErr = error as { mark?: { line?: number }; message?: string };
    return {
      parsed: null,
      errors: [{
        line: yamlErr.mark?.line !== undefined ? yamlErr.mark.line + 1 : undefined,
        message: yamlErr.message || "YAML parse error",
      }],
    };
  }
}

export function parseDsl(source: string, format: DslFormat = "yaml"): ParseResult {
  if (!source.trim()) {
    return { ast: null, errors: [{ message: "Empty input" }] };
  }

  const { parsed, errors: parseErrors } = parseStructuredSource(source, format);
  if (parseErrors.length > 0) {
    return { ast: null, errors: parseErrors };
  }

  const errors: ValidationError[] = validateDsl(parsed);
  if (errors.length > 0) {
    return { ast: null, errors };
  }

  return { ast: parsed as DslRoot, errors: [] };
}

export function serializeDsl(ast: DslRoot, format: DslFormat): string {
  if (format === "json") {
    return JSON.stringify(ast, null, 2);
  }

  return yaml.dump(ast, {
    noRefs: true,
    lineWidth: -1,
    sortKeys: false,
  });
}
