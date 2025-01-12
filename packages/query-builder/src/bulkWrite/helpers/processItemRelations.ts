import { ObjectId } from "bson";
import { assignObjectId } from "./assignObjectId";
import { checkUniqueFields } from "src/aggregation/checkUniqueFields";
import { ModelDefinition } from "@ugursahinkaya/ts-mongo-types";

export function processItemRelations(
  model: ModelDefinition<any>,
  item: any,
  relations: Record<string, any>
) {
  const itemRelations = [];
  for (const [key, rel] of Object.entries(relations)) {
    if (item[key]) {
      const relation = { ...rel, _id: item._id, pushOperation: item[key] };
      const { collect, data } = processRelationOperations(model, item[key], relation)!;
      if (!data) {
        continue;
      }
      item[key] = data;
      if (relation.field) {
        itemRelations.push({ relation, value: item[key], collect });
      }
    }
  }
  return itemRelations;
}

function processRelationOperations(model: ModelDefinition<any>, fieldValue: any, relation: any) {
  const pushOperators = ["connect", "disconnect", "set", "upsert", "update", "delete"];
  const pushOperator = Object.keys(fieldValue).find((key) => pushOperators.includes(key));
  if (!pushOperator || !fieldValue[pushOperator]) {
    return;
  }
  const result = generateRelationOperations(model, relation, pushOperator);
  return result;
}

function generateRelationOperations(
  model: ModelDefinition<any>,
  relation: any,
  pushOperator: string
): { collect: any; data: any } | undefined {
  assignObjectIdToRelation(relation);
  switch (pushOperator) {
    case "connect":
      return connectRelation(model, relation);
    /*
    case "disconnect":
      return disconnectRelation(relation);
    case "set":
      return setRelation(relation);
    case "upsert":
      return upsertRelation(relation);
    case "update":
      return updateRelation(relation);
    case "delete":
      return deleteRelation(relation);
      */
    default:
      return;
  }
}

function assignObjectIdToRelation(relation: any) {
  if (relation.id) {
    relation["_id"] = new ObjectId(relation.id);
    delete relation.id;
  } else if (!relation._id) {
    relation["_id"] = new ObjectId();
  }
}

function connectRelation(identifier: ModelDefinition<any>, relation: any) {
  assignObjectId(relation.pushOperation.connect);
  const hasUnique = checkUniqueFields(identifier, { ...relation.pushOperation.connect });

  const collect = {
    pipeline: [
      { $match: hasUnique === false ? relation.pushOperation.connect : hasUnique },
      {
        $group: {
          _id: null,
          idList: { $push: "$_id" }
        }
      },
      {
        $project: { _id: 0, idList: 1 }
      }
    ],
    db: relation.db,
    collection: relation.collection
  };
  return {
    collect,
    data: {
      [relation.array ? "$addToSet" : "$set"]: { $collectedData: [0, "idList"] }
    }
  };
}
