import { AnyBulkWriteOperation, MongoClient } from "mongodb";
import { runTransaction } from "./runTransaction";
import { Logger } from "@ugursahinkaya/logger/index";
import { simplifyResult } from "./simplifyResult";
import { useCursor } from "./cursor";
import {
  TransactionOperation,
  BulkWriteReturnType,
  FieldDefininition
} from "@ugursahinkaya/ts-mongo-types";

export type BulkWriteOperation = {
  db: string;
  collection: string;
  type: "main" | "relation" | "collect";
  payload: AnyBulkWriteOperation[];
};

export async function commit<TModel>({
  getClient,
  query,
  relationFields,
  logger,
  withCursor
}: {
  getClient: () => MongoClient;
  query: TransactionOperation<TModel>[];
  relationFields: FieldDefininition[];
  withCursor?: boolean;
  logger?: Logger;
}) {
  logger?.debug(query, "commit");
  const client = getClient();
  const session = client.startSession();
  try {
    query = query.sort((a, b) => (a.order < b.order ? -1 : 1));
    const transactionResult = await session.withTransaction(
      async () => await runTransaction<TModel>(client, session, query, logger)
    );
    const result: BulkWriteReturnType<any>[] = simplifyResult(transactionResult);
    logger?.debug(result, ["commit", "result"]);
    session.endSession();
    client.close();
    if (withCursor) {
      const cursor = await useCursor<TModel>(getClient, result, relationFields);
      return {
        result,
        ...cursor
      };
    }
    return result;
  } catch (error: any) {
    logger?.error(error.message, ["commit"]);
    session.endSession();
    client.close();
    return {
      error: error.message
    };
  }
}
