import { ObjectId } from "bson";

export function assignObjectId(item: { id?: string; _id: ObjectId }, upsert = true) {
  if (item.id) {
    item._id = new ObjectId(item.id);
  }
  if (!item._id && upsert) {
    item._id = new ObjectId();
  }
  delete item.id;
  return item;
}
