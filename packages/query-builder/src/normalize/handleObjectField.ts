import { ObjectId } from "bson";

export function handleObjectField(item: any) {
  for (const operator in item) {
    if (operator.startsWith("$")) {
      if (Array.isArray(item[operator])) {
        item[operator] = item[operator].map((i: string) => new ObjectId(i));
      } else {
        item[operator] = new ObjectId(item[operator]);
      }
    } else {
      throw new Error("Filter with relation field is not supported");
    }
  }
  return item;
}
