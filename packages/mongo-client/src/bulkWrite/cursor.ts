import { BulkWriteReturnType, FieldDefininition } from "@ugursahinkaya/ts-mongo-types";
import { MongoClient, ObjectId } from "mongodb";
export type Cursor<TModel> = { next: () => TModel | null; toArray: () => TModel[] };

export async function useCursor<TModel>(
  getClient: () => MongoClient,
  result: BulkWriteReturnType<TModel>[],
  relationFields: FieldDefininition[]
): Promise<Cursor<TModel>> {
  let cursor = -1;

  const objects = await getObjects();

  async function getObjects() {
    let res = result.find((val) => (val.type = "main"));
    if (!res || !res.db || !res.collection) {
      return [];
    }
    const idList: ObjectId[] = [];
    if (res.upsertedIds) {
      idList.push(...res.upsertedIds.map((id) => new ObjectId(id)));
    } else if (res.insertedIds) {
      idList.push(...res.insertedIds.map((id) => new ObjectId(id)));
    }

    if (idList.length === 0) {
      return [];
    }

    const pipeline: Record<string, any>[] = [
      {
        $match: {
          _id: { $in: idList }
        }
      },
      {
        $addFields: {
          id: { $toString: "$_id" }
        }
      }
    ];

    const $project: Record<string, any> = {
      _id: 0
    };

    relationFields.map((m) => {
      $project[m.name] = 0;
    });

    pipeline.push({ $project });

    return await getClient().db(res.db).collection(res.collection).aggregate(pipeline).toArray();
  }

  function next() {
    if (objects.length > cursor) {
      cursor++;
    }
    return (objects[cursor] as TModel) ?? null;
  }

  return {
    next,
    toArray: () => objects as TModel[]
  };
}
