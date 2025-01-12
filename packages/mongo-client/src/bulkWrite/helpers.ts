import { BulkWriteResult, ObjectId } from "mongodb";
import { isDate } from "util/types";

export function getValueByPath(source: any[], path: (string | number)[]): any {
  let currentValue = source;
  for (const key of path) {
    if (currentValue === undefined || currentValue === null) {
      return undefined;
    }
    currentValue = currentValue[key as keyof typeof currentValue];
  }
  return currentValue;
}

export function updateCollectedDataValues(obj: any, source: any[]): any {
  Object.entries(obj).forEach(([key, value]) => {
    if (key === "$collectedData") {
      obj = getValueByPath(source, obj[key]);
    } else if (
      value &&
      typeof value === "object" &&
      !ObjectId.isValid(obj[key]) &&
      !isDate(value)
    ) {
      obj[key] = updateCollectedDataValues(value, source);
    }
  });
  return obj;
}

export function collectRelationIds(
  //client: MongoClient,
  collectedData: any[],
  //updatedRelationFields: Record<string, any>[],
  bulkWriteOp: any,
  operation: "updateOne" | "updateMany" | "deleteMany"
) {
  if (collectedData.length > 0) {
    bulkWriteOp = updateCollectedDataValues(bulkWriteOp, collectedData);
  }
  /*
  for (const f of updatedRelationFields) {
    const name = f.relation.name as keyof Omit<TModel, "_id" | "id">;
    if (bulkWriteOp.update?.$set && !bulkWriteOp.update.$set[name] && f.filter) {
      try {
        const item = await client
          .db(f.relation.args.db)
          .collection(f.relation.args.collection)
          .findOne(f.filter, { projection: { [f._id]: 1 } });
        if (item) {
          //@ts-ignore
          bulkWriteOp.update.$set[name] = item["_id"];
        }
      } catch (e) {
        console.error("findOne fail", e);
      }
    }
  }
    */
  const mainOp = extractOperators(bulkWriteOp);
  return checkRelationOperations(mainOp, operation);
}

export function checkRelationOperations(mainOp: any, operation: string) {
  const operations = [];
  const _tempId = new ObjectId();
  const updateOperators = [
    //"$set",
    "$unset",
    "$inc",
    "$rename",
    "$min",
    "$max",
    "$mul",
    "$currentDate",
    "$addToSet",
    "$push",
    "$pull",
    "$pullAll",
    "$pop",
    "$each",
    "$slice",
    "$sort"
  ];
  const foundedOperators = updateOperators.filter((op) => Object.keys(mainOp.update).includes(op));

  if (foundedOperators.length > 0) {
    mainOp.update.$set["_tempId"] = _tempId;
    const updateRecord: Record<string, any> = {};
    foundedOperators.forEach((updateOperator) => {
      mainOp.update.$setOnInsert = {};
      if (mainOp.update.$set.lastSave) {
        mainOp.update.$setOnInsert["firstSave"] = mainOp.update.$set.lastSave;
      }
      updateRecord[updateOperator] = {};
      const val = mainOp.update[updateOperator];
      Object.keys(val).forEach((key) => {
        mainOp.update.$setOnInsert[key] = [];
        updateRecord[updateOperator][key] = Array.isArray(val[key])
          ? { $each: val[key] }
          : val[key];
      });
      delete mainOp.update[updateOperator];
    });
    updateRecord["$unset"] = { _tempId: 1 };
    operations.push({
      updateOne: {
        filter: { _tempId },
        update: updateRecord
      }
    });
  }

  operations.unshift({ [operation]: mainOp });
  return operations;
}

export function collectRelationFieldValues(
  bulkWriteOperation: any,
  relationFields: any[]
): Record<string, any>[] {
  const collectedValues: Record<string, any>[] = [];
  if (!bulkWriteOperation) {
    return collectedValues;
  }
  const relationFieldKeys = relationFields.map((f) => f.args!.field);
  Object.keys(bulkWriteOperation.update).forEach((updateOperator) => {
    const updateFields = bulkWriteOperation.update[updateOperator];
    relationFieldKeys.forEach((key) => {
      if (updateFields.hasOwnProperty(key)) {
        const fieldValue = updateFields[key];
        collectedValues.push({
          value: fieldValue,
          relation: relationFields.filter((f) => f.args.field === key)[0],
          key,
          filter: bulkWriteOperation.filter
        });
      }
    });
  });

  return collectedValues;
}

export function checkResult(
  operation: "updateOne" | "updateMany" | "deleteMany",
  mainUpdateResult: BulkWriteResult,
  upsert?: boolean
) {
  if (operation.includes("delete")) {
    if (mainUpdateResult.deletedCount === 0) {
      return false;
    }
  }
  if (
    (upsert && mainUpdateResult.upsertedCount === 0 && mainUpdateResult.modifiedCount === 0) ||
    (!upsert && mainUpdateResult.insertedCount === 0 && mainUpdateResult.modifiedCount === 0)
  ) {
    return false;
  }
  return true;
}

export function extractOperators(updateObj: any): any {
  const { filter, update, upsert } = updateObj;
  const extractedUpdate: Record<string, unknown> = {};
  const newSet: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(update.$set || {})) {
    if (typeof value === "object" && value !== null && Object.keys(value)[0]?.startsWith("$")) {
      const operator = Object.keys(value)[0]!;
      extractedUpdate[operator] = extractedUpdate[operator] || {};
      //@ts-ignore
      extractedUpdate[operator][key] = value[operator];
    } else {
      newSet[key] = value;
    }
  }
  const newUpdate = {
    ...(Object.keys(newSet).length ? { $set: newSet } : {}),
    ...extractedUpdate
  };
  const res = { filter, update: newUpdate, upsert };
  return res;
}
