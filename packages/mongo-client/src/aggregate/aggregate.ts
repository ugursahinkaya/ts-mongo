import { MongoClient } from "mongodb";
export async function aggregate<TModel>(
  client: MongoClient,
  query: {
    operation: string;
    db: string;
    collection: string;
    pipeline: any[];
  }
) {
  try {
    return (await client
      .db(query.db)
      .collection(query.collection)
      .aggregate(query.pipeline)
      .next()) as {
      list: TModel[];
      pagination: {
        totalCount: number;
        totalPageCount: number;
        firstItemIndex: number;
        lastItemIndex: number;
        currentPage: number;
        rowsPerPage: number;
        sort: { [K in keyof TModel]?: 1 | -1 };
      };
    };
  } finally {
    client.close();
  }
}
