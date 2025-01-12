import { FieldDefininition } from "@ugursahinkaya/ts-mongo-types";
import { ObjectId } from "bson";
import crypto from "crypto";
export function handleAutoField(
  item: Record<string, any>,
  key: keyof Record<string, any>,
  field: FieldDefininition
) {
  let value = item[key] as any;
  const now = new Date();
  if (field.args) {
    if (field.args.auto) {
      if (field.args.unique) {
        if (field.args.generator === "uuid") {
          value = value ?? crypto.randomUUID().replace(/-/g, "");
        }
      } else if (field.args.autoNow) {
        value = now;
      }
    } else if (field.args.map === "_id") {
      value = new ObjectId();
    }
  }
  if (!field.args?.autoNowAdd) {
    item[key] = value;
  }
}
