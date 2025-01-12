import { MongoClient } from "mongodb";
export async function aggregateForCount(
  client: MongoClient,
  query: {
    operation: string;
    db: string;
    collection: string;
    pipeline: any[];
  }
) {
  try {
    const result = (await client
      .db(query.db)
      .collection(query.collection)
      .aggregate(query.pipeline)
      .next()) as {
      totalCount: number;
    };
    return result ? (result.totalCount ?? 0) : 0;
  } finally {
    client.close();
  }
}
