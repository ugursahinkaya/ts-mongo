import {
  TransactionOperation,
  BulkWriteOperation,
  AggregateOperation
} from "@ugursahinkaya/ts-mongo-types";
import { ClientSession, MongoClient } from "mongodb";
import { Logger } from "@ugursahinkaya/logger";
import { handleBulkWriteOperation } from "./handleBulkWriteOperation";
import { handleAggregateOperation } from "../aggregate/handleAggregateOperation";
/**
 * Executes a set of transactional operations grouped by stages.
 */
export async function runTransaction<TModel>(
  client: MongoClient,
  session: ClientSession,
  operations: TransactionOperation<TModel>[],
  logger?: Logger
) {
  logger?.trace(operations, "runTransaction");
  const collectedData: Record<string, any>[] = [];
  const results: any[] = [];
  for (const operation of operations) {
    const { db, collection, process, stage } = operation;

    if (process === "bulkWrite") {
      const bulkResult = await handleBulkWriteOperation(
        client,
        session,
        operation as BulkWriteOperation<TModel>,
        collectedData
      );
      results.push({ ...bulkResult, db, collection, stage });
    } else if (process === "aggregate") {
      const aggregateResult = await handleAggregateOperation(
        client,
        session,
        operation as AggregateOperation
      );
      collectedData.push(...aggregateResult);
    }
  }
  logger?.trace(results, ["runTransaction", "result"]);
  return results;
}
