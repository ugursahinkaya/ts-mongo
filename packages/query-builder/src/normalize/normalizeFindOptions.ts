import { FieldDefininition, PipelineObject } from "@ugursahinkaya/ts-mongo-types";
import { normalizeProjection } from "./normalizeProjection";

export function normalizeFindOptions<TModel extends Record<string, any> & { _id?: any }>(
  args: any,
  fields: Record<string, FieldDefininition>,
  relationFieldKeys: (keyof TModel)[]
) {
  const findOptions: PipelineObject<TModel> = {};
  findOptions.projection = {};
  if (args) {
    findOptions.projection = args.select ?? {};

    if (args.limit) {
      findOptions.limit = args.limit;
    }
    if (args.skip) {
      findOptions.skip = args.skip;
    }
    if (args.sort) {
      findOptions.sort = args.sort;
    }
  }
  const includeKeys = Object.keys(args.include || {});

  Object.keys(fields).forEach((key) => {
    if (!includeKeys.includes(key)) {
      //@ts-expect-error TODO: fix this
      findOptions.projection![key] = 0;
    } else {
      //@ts-expect-error TODO: fix this
      findOptions.projection![key] = 1;
    }
  });
  findOptions.projection = findOptions.projection
    ? normalizeProjection(findOptions.projection, fields, relationFieldKeys)
    : {};

  return findOptions;
}
