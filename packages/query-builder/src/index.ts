import { Interpreter } from "./interpreter";
import {
  CountQuery,
  DeleteQuery,
  GetQuery,
  ModelBase,
  ModelDefinition,
  PullQuery,
  PushQuery
} from "@ugursahinkaya/ts-mongo-types";
import { Logger } from "@ugursahinkaya/logger";
import { ObjectId } from "bson";
//import { fillAutoFields } from "./aggregation/fillAutoFields";
const DEFAULT_PAGE_LIMIT = 50;
export function QueryBuilder<TModel extends ModelBase>({
  identifiers,
  modelName,
  logLevel
}: {
  identifiers: Record<string, ModelDefinition<any>>;
  modelName: keyof typeof identifiers;
  logLevel?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
}) {
  const identifier = identifiers[modelName] as ModelDefinition<TModel>;
  if (!identifier) {
    throw new Error(`Model ${modelName} not found in identifiers`);
  }
  const logger = logLevel ? new Logger("query-builder", "#57d", logLevel) : undefined;
  const core = new Interpreter(identifier, logger);

  const count: CountQuery<TModel> = ({ where, limit, skip, sort }) => {
    logger?.debug({ where, limit, skip, sort }, ["count"]);
    const finalPipeline = [
      ...core.generatePipeline({ where, limit, skip, sort }),
      { $count: "totalCount" }
    ];
    const result = {
      operation: "aggregateForCount",
      db: core.db,
      collection: core.collection,
      pipeline: finalPipeline
    };
    logger?.debug(result, ["count", "result", identifier.collectionArgs?.collectionName]);
    return result;
  };

  const get: GetQuery<TModel> = ({ where, select, include }) => {
    logger?.debug({ where, select, include }, ["get", identifier.collectionArgs?.collectionName]);
    const mainPipeline = core.generatePipeline({ where, select, include });
    const finalPipeline = [
      {
        $facet: {
          item: mainPipeline,
          totalCount: [mainPipeline[0], { $count: "count" }]
        }
      },
      {
        $addFields: {
          item: { $arrayElemAt: ["$item", 0] },
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] }
        }
      }
    ];

    const result = {
      operation: "aggregateForSingleItem",
      db: core.db,
      collection: core.collection,
      pipeline: finalPipeline
    };
    logger?.debug(result, ["get", "result", identifier.collectionArgs?.collectionName]);
    return result;
  };

  const pull: PullQuery<TModel> = ({ where, select, include, limit, skip, sort }) => {
    logger?.debug({ where, select, include, limit, skip, sort }, [
      "pull",
      identifier.collectionArgs?.collectionName
    ]);

    const mainPipeline = core.generatePipeline({
      where,
      select,
      include,
      limit,
      skip,
      sort
    });
    logger?.trace(mainPipeline, ["mainPipeline", identifier.collectionArgs?.collectionName]);
    const rowsPerPage = limit ?? DEFAULT_PAGE_LIMIT;
    const currentPage = Math.floor(skip ? skip / rowsPerPage : 1);
    //const lastItemIndex = (skip ?? 0) + rowsPerPage - 1;
    const finalPipeline = [
      {
        $facet: {
          list: mainPipeline,
          totalCount: [{ $count: "count" }]
        }
      },
      {
        $addFields: {
          pagination: {
            totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
            totalPageCount: {
              $floor: { $divide: [{ $arrayElemAt: ["$totalCount.count", 0] }, rowsPerPage] }
            },
            firstItemIndex: skip ?? 0,
            lastItemIndex: {
              $subtract: [{ $arrayElemAt: ["$totalCount.count", 0] }, 1]
            },
            currentPage: currentPage,
            rowsPerPage: rowsPerPage,
            sort: sort ?? {}
          }
        }
      }
    ];
    const result = {
      operation: "aggregateForManyItems",
      db: core.db,
      collection: core.collection,
      pipeline: finalPipeline
    };
    logger?.debug(result, ["pull", "result", identifier.collectionArgs?.collectionName]);
    return result;
  };

  const push: PushQuery<TModel> = ({ data, where, upsert }) => {
    logger?.debug({ data, where, upsert }, ["push", identifier.collectionArgs?.collectionName]);
    let whereId: ObjectId | undefined;
    if (Array.isArray(data) && data.length === 1 && data[0]) {
      data = data[0];
    }

    if (Array.isArray(data)) {
      if (where) {
        const err = "Where condition is not supported for array input";
        logger?.error(err, ["push"]);
        throw new Error(err);
      }
    } else {
      whereId = where && "id" in where ? new ObjectId(where.id as string) : undefined;
      if (where && "id" in where && where.id) {
        where["_id"] = whereId;
        delete where.id;
      }
    }

    // const items = fillAutoFields(data, core.autoFields, where as Record<string, any>);
    const result = core.generatePushOperations(data, where!, upsert);
    logger?.debug(result, ["push", "result", identifier.collectionArgs?.collectionName]);
    return result;
  };

  const remove: DeleteQuery<TModel> = ({ where, ...relations }) => {
    logger?.debug({ where, relations }, ["remove"]);
    logger?.debug({ where, relations }, ["remove", identifier.collectionArgs?.collectionName]);
    const result = core.generateRemoveOperations({ where, ...relations });
    logger?.debug(result, ["delete", "result", identifier.collectionArgs?.collectionName]);
    return result;
  };

  return { get, pull, push, remove, count };
}
