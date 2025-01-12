import { MongoClient } from "mongodb";

export async function aggregateForSingleItem<TModel>(
  client: MongoClient,
  query: {
    operation: string;
    db: string;
    collection: string;
    pipeline: any[];
  }
) {
  try {
    const { item, totalCount } = (await client
      .db(query.db)
      .collection(query.collection)
      .aggregate(query.pipeline)
      .next()) as {
      item: TModel | null;
      totalCount: number;
    };

    return { totalCount, item };
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    client.close();
  }
}
