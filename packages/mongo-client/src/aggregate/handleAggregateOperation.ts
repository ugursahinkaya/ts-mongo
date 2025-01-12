import { AggregateOperation } from "@ugursahinkaya/ts-mongo-types";
import { MongoClient, ClientSession } from "mongodb";

/**
 * Handles an aggregate operation within a transaction.
 */
export async function handleAggregateOperation(
  client: MongoClient,
  session: ClientSession,
  operation: AggregateOperation
) {
  const { db, collection, pipeline } = operation;
  return await client.db(db).collection(collection).aggregate(pipeline, { session }).toArray();
}
