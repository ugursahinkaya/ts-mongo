import { BulkWriteOperation } from "@ugursahinkaya/ts-mongo-types";
import { MongoClient, ClientSession } from "mongodb";
import { replaceCollectedDataValues } from "./replaceCollectedDataValues";
import { checkRules } from "../transactionChecker/checkRules";

/**
 * Handles a bulkWrite operation within a transaction.
 */
export async function handleBulkWriteOperation<TModel>(
  client: MongoClient,
  session: ClientSession,
  operation: BulkWriteOperation<TModel>,
  collectedData: Record<string, any>[]
) {
  const { db, collection, expect } = operation;
  let { payload } = operation;
  payload = replaceCollectedDataValues(payload, collectedData);
  //@ts-ignore
  const result = await client.db(db).collection(collection).bulkWrite(payload, { session });
  if (expect) {
    const errors = checkRules(expect, { result });
    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors, null, 2));
    }
  }
  return result;
}
