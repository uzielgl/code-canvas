import yaml from "js-yaml";
import { type ParseResult, type ValidationError, validateDsl } from "./dsl-schema";

export function parseDsl(source: string): ParseResult {
  if (!source.trim()) {
    return { ast: null, errors: [{ message: "Empty input" }] };
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(source);
  } catch (e: unknown) {
    const yamlErr = e as { mark?: { line?: number }; message?: string };
    return {
      ast: null,
      errors: [{
        line: yamlErr.mark?.line !== undefined ? yamlErr.mark.line + 1 : undefined,
        message: yamlErr.message || "YAML parse error",
      }],
    };
  }

  const errors: ValidationError[] = validateDsl(parsed);
  if (errors.length > 0) {
    return { ast: null, errors };
  }

  return { ast: parsed as any, errors: [] };
}
