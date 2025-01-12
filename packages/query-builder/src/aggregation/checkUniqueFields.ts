import { ModelDefinition } from "@ugursahinkaya/ts-mongo-types";

export function checkUniqueFields(identifier: ModelDefinition<any>, filter: Record<string, any>) {
  delete filter._id;
  const upsert = Object.values(identifier.fields)
    .filter((field) => field.args?.unique || field.args?.primaryKey)
    .map((field) => field.name)
    .some((f) => Object.keys(filter).includes(f));
  if (upsert) {
    return filter;
  }
  return false;
}
