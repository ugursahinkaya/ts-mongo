import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { commit } from "./bulkWrite/commit";
import { aggregate, aggregateForCount, aggregateForSingleItem } from "./aggregate/";
import { Logger, LogLevel } from "@ugursahinkaya/logger";
import { QueryBuilder } from "@ugursahinkaya/query-builder";
import {
  Delete,
  Get,
  ModelBase,
  Pull,
  Push,
  ModelDefinition,
  Count,
  FieldDefininition
} from "@ugursahinkaya/ts-mongo-types";

dotenv.config();
const DATABASE_URL = process.env.DATABASE_URL;

export function useMongoClient<TModel extends ModelBase>(
  identifiers: Record<string, ModelDefinition<any>>,
  modelName: keyof typeof identifiers,
  options?: { databaseUrl?: string; logLevel?: LogLevel }
) {
  let databaseUrl = options?.databaseUrl;

  const relationFields: FieldDefininition[] = [];
  const identifier = identifiers[modelName] as ModelDefinition<TModel>;

  Object.entries(identifier.fields).forEach(([, field]) => {
    if (field.args?.relation) relationFields.push(field);
  });

  if (!databaseUrl) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }
    databaseUrl = DATABASE_URL;
  }
  const logger = options?.logLevel
    ? new Logger("mongo-client", "#5d3", options.logLevel)
    : undefined;

  const queryBuilder = QueryBuilder<TModel>({
    identifiers,
    modelName,
    logLevel: options?.logLevel
  });

  const getClient = () => {
    try {
      return new MongoClient(databaseUrl!);
    } catch {
      throw new Error("MongoClient is not connected");
    }
  };

  //@ts-ignore
  const get: Get<TModel> = async (payload) => {
    logger?.debug(payload, ["get", identifier.collectionArgs.collectionName]);
    const result = await aggregateForSingleItem(getClient(), queryBuilder.get(payload));
    logger?.info(result, ["get", "result", identifier.collectionArgs.collectionName]);
    return result;
  };

  //@ts-ignore
  const pull: Pull<TModel> = async (payload) => {
    logger?.debug(payload, ["pull", identifier.collectionArgs.collectionName]);
    const result = await aggregate(getClient(), queryBuilder.pull(payload));
    logger?.info(result, ["pull", "result", identifier.collectionArgs.collectionName]);
    return result;
  };

  //@ts-ignore
  const push: Push<TModel> = async (payload) => {
    logger?.info(payload, ["push", identifier.collectionArgs.collectionName]);
    const result = await commit({
      getClient,
      relationFields,
      query: queryBuilder.push(payload),
      logger
    });
    if ("error" in result) {
      logger?.error(result["error"], ["push", identifier.collectionArgs.collectionName]);
      return result;
    }
    logger?.info("success", ["push", identifier.collectionArgs.collectionName]);
    return true;
  };

  //@ts-ignore
  const remove: Delete<TModel> = async (payload) => {
    logger?.debug(payload, ["delete", identifier.collectionArgs.collectionName]);
    const result = await commit({
      getClient,
      relationFields,
      query: queryBuilder.remove(payload),
      logger
    });
    logger?.info(result, ["delete", "result", identifier.collectionArgs.collectionName]);
    return result;
  };

  const count: Count<TModel> = async (payload) => {
    logger?.debug(payload, ["count", identifier.collectionArgs.collectionName]);
    const result = await aggregateForCount(getClient(), queryBuilder.count(payload));
    logger?.info(result, ["count", "result", identifier.collectionArgs.collectionName]);
    return result;
  };

  return { get, pull, push, delete: remove, count };
}
