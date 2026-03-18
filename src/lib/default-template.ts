import { serializeDsl } from "./dsl-parser";
import { DEFAULT_EXAMPLE_ID, getBuiltInExampleById } from "./template-catalog";

const defaultExample = getBuiltInExampleById(DEFAULT_EXAMPLE_ID);

if (!defaultExample) {
  throw new Error(`Missing default example: ${DEFAULT_EXAMPLE_ID}`);
}

export const DEFAULT_DSL = serializeDsl(defaultExample.document, "yaml");
export const DEFAULT_JSON_DSL = serializeDsl(defaultExample.document, "json");
