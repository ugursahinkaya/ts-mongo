import { handleAutoField } from "./handleAutoField";

export function fillAutoFields(
  items: any,
  autoFields: Record<string, any>,
  where: Record<string, any>
) {
  items = Array.isArray(items) ? items : [items];
  for (const item of items) {
    for (const [key, field] of Object.entries(autoFields)) {
      if (!item[key] && (where === undefined || !where[key])) {
        handleAutoField(item, key, field);
      }
    }
  }
  return items;
}
