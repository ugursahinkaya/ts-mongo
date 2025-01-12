import { BulkWritePayload, QueryConditions } from "@ugursahinkaya/ts-mongo-types";
import { ObjectId } from "bson";
import { handleObjectField } from "./handleObjectField";

export function normalizeFind<TModel extends Record<string, any> & { _id?: any }>(
  where: QueryConditions<TModel>,
  fields: Record<string, any>
): BulkWritePayload<TModel>["filter"] {
  const find: BulkWritePayload<TModel>["filter"] = {};
  for (const key of Object.keys(where)) {
    const field = fields[key];
    if (!field) {
      throw new Error(`Field ${key} not found in schema`);
    }
    let itemKey = key;
    if (field.args?.map) {
      itemKey = field.args.map;
      find[itemKey] = where[key];
      if (field.type === "ObjectId") {
        find[itemKey] = new ObjectId(find[itemKey]);
      }
      continue;
    }
    const value = where[itemKey];

    if (field.args?.relation) {
      if (field.array) {
        if (value && Array.isArray(value)) {
          find[itemKey] = value.map((i: string) => new ObjectId(i));
          continue;
        }
        if (typeof find[itemKey] === "object") {
          find[itemKey] = handleObjectField(value);
          continue;
        }
        find[itemKey] = new ObjectId(value as string);
        continue;
      }
      if (typeof find[itemKey] === "object") {
        find[itemKey] = handleObjectField(value);
        continue;
      }
      find[itemKey] = new ObjectId(value as string);
    }

    if (field.type === "Date") {
      find[itemKey] = new Date(value as string);
      continue;
    }
    if (field.type === "ObjectId") {
      find[itemKey] = new ObjectId(value as string);
      continue;
    }

    find[itemKey] = value;
  }
  return find;
}
