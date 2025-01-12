import { ObjectId } from "bson";

export function disconnectIfNecessary(relatedObj: any, relation: any, id?: ObjectId) {
  if (!id) {
    return {};
  }
  if (relation.args.relation.startsWith("One")) {
    const result = {
      updateOne: {
        filter: { [relation.name]: relatedObj._id, _id: { $ne: id } },
        update: relation.array
          ? { $pull: { [relation.name]: relatedObj._id } }
          : { $set: { [relation.name]: null } },
        collection: relation.collection,
        db: relation.db
      }
    };
    return result;
  }
  return {};
}
