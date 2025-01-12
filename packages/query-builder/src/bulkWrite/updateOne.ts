import { ObjectId } from "bson";

export function updateOne(
  item: any,
  operation: "updateOne" | "updateMany" | "deleteMany",
  options: { where?: Record<string, any>; upsert?: boolean } = { where: {}, upsert: true },
  db: string,
  collection: string
) {
  if (!item._id) {
    item._id = item.id ? new ObjectId(item.id as string) : new ObjectId();
  }
  const { _id, id, ...$set } = item;
  const filter = options.where ? options.where : { _id };
  const { upsert } = options;
  const result = {
    [operation]: {
      filter,
      update: { $set },
      upsert,
      collection,
      db
    }
  };
  return result;
}
