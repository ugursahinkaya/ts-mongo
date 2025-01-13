import {
  FieldDefininition,
  ModelDefinition,
  ModelField,
  PullParams,
  GetParams,
  BulkWriteOperation,
  DeleteParams,
  AnyBulkWriteOperation,
  TransactionOperation,
  QueryConditions,
  DeleteRelationBehavior,
  AggregateOperation
} from "@ugursahinkaya/ts-mongo-types";
import { Logger } from "@ugursahinkaya/logger";
import { pipelineObjectToArray, generateLookups, fillAutoFields } from "./aggregation";
import { normalizeFind, normalizeFindOptions } from "./normalize";
import { assignObjectId } from "./bulkWrite/helpers/assignObjectId";
import { checkUniqueFields } from "./aggregation/checkUniqueFields";
import { ObjectId } from "bson";
import crypto from "crypto";
const TRANSACTION_KEY = `transactionKey`;
const OPERATION_KEY = `operationKey`;
export class Interpreter<TModel extends Record<string, any> & { _id?: any }> {
  relationFields: Record<string, any>;
  relationFieldKeys: TModel["$relationKeys"][];
  relationList: (ModelField & { db: string; collection: string })[] = [];
  autoFields: Record<string, FieldDefininition>;
  db: string;
  collection: string;
  constructor(
    public identifier: ModelDefinition<TModel>,
    public logger?: Logger
  ) {
    this.db = identifier.collectionArgs?.dbName;
    this.collection = identifier.collectionArgs?.collectionName;
    this.relationFields = this.extractRelations();
    this.autoFields = this.extractAutoFields();
    this.relationFieldKeys = Object.keys(this.relationFields) as TModel["$relationKeys"][];
    this.fillRelationList();
  }

  generatePipeline(payload: PullParams<TModel, any, any> & GetParams<TModel, any, any>) {
    this.logger?.debug(payload, ["pullBasePipeline"]);
    const { where, ...options } = payload;
    const pipeline = options
      ? normalizeFindOptions(options, this.identifier.fields, this.relationFieldKeys)
      : {};
    pipeline.match = normalizeFind(where, this.identifier.fields);
    const relationsPipeline = options?.include
      ? generateLookups(options.include, this.identifier.fields)
      : {};
    return pipelineObjectToArray({
      ...pipeline,
      ...relationsPipeline
    });
  }

  generateRemoveOperations({
    where,
    ...relations
  }: DeleteParams<TModel>): TransactionOperation<TModel>[] {
    const operations: TransactionOperation<TModel>[] = [this.generateDeleteManyOperation(where)];

    if (Object.keys(relations).length > 0) {
      operations.push(this.generateCollectIdListOperation(where));
    }

    Object.entries(relations as Record<string, DeleteRelationBehavior>).forEach(
      ([key, behaviour]) => {
        const operation = this.generateDisconnectOrDeleteRelationOperation(key, behaviour);
        if (operation) {
          operations.push(operation);
        }
      }
    );

    return operations;
  }
  hasUniqueValue(item: TModel): boolean {
    return Object.keys(item).some((key) => {
      if (this.identifier.fields[key]?.args?.unique) {
        return this.identifier.fields[key]?.args?.unique && item[key];
      }
    });
  }
  generateMainRawUpdate(item: TModel, selector: Record<string, any>, now = new Date()) {
    const { _id, ...itemData } = item;
    const $set = { ...selector, ...itemData };
    const update: Record<string, any> = { $set, $setOnInsert: {} };
    Object.entries(this.identifier.fields).forEach(([key, field]) => {
      if (!field.args?.relation) {
        if (field.args?.auto) {
          if (field.args?.autoNowAdd) {
            update.$setOnInsert[key] = now;
          } else if (field.args.autoNow) {
            update.$set[key] = now;
          } else if (field.args.generator) {
            if (!item[key]) {
              if (field.args.generator === "uuid") {
                update.$setOnInsert[key] = crypto.randomUUID().replace(/-/g, "");
              }
            }
          }
        }
      }
    });

    Object.entries(this.relationFields).forEach(([key, relationField]) => {
      update.$setOnInsert[key] = relationField.array ? [] : null;
      delete update.$set[key];
    });
    return update;
  }

  generateRelationSet(item: TModel) {
    const $addToSet: Record<string, any> = {};
    Object.entries(this.relationFields).forEach(([key, relation]) => {
      if (item[key]) {
        $addToSet[key] = relation.array
          ? { $each: { $collectedData: [0, relation.collection] } }
          : { $collectedData: [0, relation.collection] };
      }
    });
    return $addToSet;
  }

  generatePushOperations(
    items: any,
    where: Record<string, any>,
    upsert: boolean = false
  ): TransactionOperation<TModel>[] {
    const now = new Date();
    const operations: TransactionOperation<TModel>[] = [];
    items = Array.isArray(items) ? items : [items];
    const transactionKey = new ObjectId();

    const mainWriteOperation: BulkWriteOperation<TModel> = {
      process: "bulkWrite",
      db: this.db,
      collection: this.collection,
      stage: "saveRawRecord",
      type: "main",
      order: 1,
      payload: []
    };
    const relationOperation: BulkWriteOperation<TModel> = {
      process: "bulkWrite",
      db: this.db,
      collection: this.collection,
      stage: "saveRelationIds",
      type: "main",
      order: 3,
      payload: []
    };
    let itemIndex = 0;
    let relationPayload: AnyBulkWriteOperation<TModel>;
    items.forEach((item: any) => {
      const operationKey = new ObjectId();
      const queryHasUniqueValue = this.hasUniqueValue({ ...item, ...where });
      const updateType =
        item._id || item.id || queryHasUniqueValue
          ? "updateOne"
          : where === undefined && upsert
            ? "insertOne"
            : "updateMany";
      //assignObjectId(item, upsert);
      /*
      let filter =
        where || queryHasUniqueValue
          ? where
          : item._id
            ? { _id: item._id }
            : { _id: { $in: { $collectedData: [0, this.collection, itemIndex] } } };
            */
      if (updateType === "insertOne") {
        mainWriteOperation.payload.push({
          [updateType]: {
            ...item,
            [TRANSACTION_KEY]: transactionKey,
            [OPERATION_KEY]: operationKey
          }
        });
      } else {
        let filter = item._id ? { _id: item._id } : where;
        const selector =
          updateType === "updateMany"
            ? {
                [OPERATION_KEY]: operationKey,
                [TRANSACTION_KEY]: transactionKey
              }
            : where;
        let update = this.generateMainRawUpdate(item, selector, now);
        mainWriteOperation.payload.push({
          [updateType]: {
            filter,
            update,
            upsert
          }
        });
        if (updateType === "updateMany") {
          itemIndex++;
        }
      }
      if (!relationPayload) {
        const $addToSet = this.generateRelationSet(item);
        relationPayload = {
          updateMany: {
            filter: {
              [TRANSACTION_KEY]: transactionKey
            },
            $addToSet,
            update: {
              $unset: {
                [TRANSACTION_KEY]: 1,
                [OPERATION_KEY]: 1
              }
            },
            upsert: false
          }
        } as AnyBulkWriteOperation<TModel>;
        relationOperation.payload.push(relationPayload);
      }
    });

    operations.push(mainWriteOperation);
    if (relationOperation.payload.length > 0) {
      operations.push(relationOperation);
    }
    return operations;
  }

  private connectRelation(data: Record<string, any>, relation: any, _tempId: Record<string, any>) {
    const { collection, db } = relation;

    const connectIsArray = Array.isArray(data);
    const update: Record<string, any> = {
      $unset: {
        [TRANSACTION_KEY]: 1
      }
    };
    const expect: Record<string, any>[] = [
      {
        source: "result",
        message: `Unable to establish a relationship. ${relation.to} could not be found for ${connectIsArray ? "one or more of the given selectors: " : "the given selector: "} ${JSON.stringify(data)}. The connect operator should only be used if the referenced object exists in the database. Did you mean to use an update, set, or upsert operation instead? See documentation: https://tagi.dev/docs/relations`,
        expect: [{ selector: ["matchedCount"], condition: { gt: 0 } }]
      }
    ];
    if (relation.relationFields.filter((i: any) => i[0] === relation.field)[0][2]) {
      update.$addToSet = {
        [relation.field]: { $each: { $collectedData: [0, this.collection] } }
      };
    } else {
      update.$set = {
        [relation.field]: { $collectedData: [0, this.collection, 0] }
      };
    }
    return [
      {
        process: "bulkWrite",
        db,
        collection,
        expect,
        type: "relation",
        stage: "connectRelations",
        order: 3,
        payload: [
          {
            [connectIsArray ? "updateMany" : "updateOne"]: {
              filter: _tempId,
              update,
              upsert: false
            }
          }
        ]
      }
    ] as TransactionOperation<any>[];
  }
  private setRelation(data: Record<string, any>, relation: any, _tempId: Record<string, any>) {
    const { collection, db } = relation;

    const connectIsArray = Array.isArray(data);
    const update: Record<string, any> = {
      $unset: {
        [TRANSACTION_KEY]: 1
      }
    };
    if (relation.relationFields.filter((i: any) => i[0] === relation.field)[0][2]) {
      update.$addToSet = {
        [relation.field]: { $each: { $collectedData: [0, this.collection] } }
      };
    } else {
      update.$set = {
        [relation.field]: { $collectedData: [0, this.collection, 0] }
      };
    }
    return [
      {
        process: "bulkWrite",
        db,
        collection,
        type: "relation",
        stage: "settRelations",
        order: 3,
        payload: [
          {
            [connectIsArray ? "updateMany" : "updateOne"]: {
              filter: _tempId,
              update,
              upsert: false
            }
          }
        ]
      }
    ] as TransactionOperation<any>[];
  }
  private processRelationUpdate(
    value: Record<string, any>,
    tempId: Record<string, any>,
    relation?: any
  ): TransactionOperation<any>[] {
    const { field: relationField, collection, db, pushOperation } = relation;
    const operations: any[] = [];
    let { _id, ...data } = value;

    if (pushOperation.connect) {
      data = data.connect;
      operations.push(...this.connectRelation(pushOperation.connect, relation, tempId));
    } else if (pushOperation.set) {
      data = data.connect;
      operations.push(...this.setRelation(pushOperation.set, relation, tempId));
    }

    const filter = this.createFilter(_id, data, pushOperation);
    let $set = this.createSet(data, relation);
    const $setOnInsert = this.createSetOnInsert(relationField, relation, $set);

    this.handleAutoFields(relation, $set, filter);
    $set = { ...$set, ...tempId };

    const update = { $set, $setOnInsert };
    const finalFilter = this.applyUniqueConstraints(filter);

    return [
      ...operations,
      {
        process: "bulkWrite",
        collection,
        db,
        type: "relation",
        stage: "saveRawRecord",
        order: 1,
        payload: [
          {
            updateMany: {
              filter: finalFilter,
              update,
              upsert: true
            }
          }
        ]
      }
    ];
  }

  private createFilter(
    _id: any,
    data: Record<string, any>,
    pushOperation: any
  ): Record<string, any> {
    if (pushOperation.set) {
      return Array.isArray(pushOperation.set.where)
        ? { $or: pushOperation.set.where.map((i: any) => assignObjectId(i, false)) }
        : assignObjectId(pushOperation.set.where);
    }

    const filter: Record<string, any> = {};
    if (_id) filter["_id"] = _id;
    if (data.where?.id) filter["_id"] = data.where.id;
    return filter;
  }

  private createSet(data: Record<string, any>, relation: any): Record<string, any> {
    let $set = { ...data };
    delete $set.connect;
    delete $set.set;

    Object.entries($set).forEach(([key, value]) => {
      if (relation.relationFields.find((field: any) => field[0] === key)) {
        $set[key] = Array.isArray(value)
          ? value.map((i: any) => new ObjectId(i))
          : new ObjectId(value);
      }
    });

    return $set;
  }

  private createSetOnInsert(
    relationField: string,
    relation: any,
    $set: Record<string, any>
  ): Record<string, any> {
    return {
      [relationField]: relation.relationFields.find((field: any) => field[0] === relationField)?.[2]
        ? []
        : null,
      firstSave: $set["lastSave"]
    };
  }

  private handleAutoFields(
    relation: any,
    $set: Record<string, any>,
    filter: Record<string, any>
  ): void {
    if (!relation.autoFields?.length) return;

    const auto: Record<string, any> = {};
    relation.autoFields.forEach(([key, args]: [string, any]) => {
      auto[key] = { args };
    });

    const [updatedSet] = fillAutoFields($set, auto, $set);
    Object.assign($set, updatedSet);

    Object.keys(filter).forEach((key) => {
      if ($set[key]) $set[key] = filter[key];
    });
  }

  private applyUniqueConstraints(filter: Record<string, any>): Record<string, any> {
    const uniqueConstraints = checkUniqueFields(this.identifier, filter);
    return uniqueConstraints || filter;
  }

  public generateRelationUpdateOperations(item: any, transactionKey: ObjectId) {
    assignObjectId(item);
    const relationOperations: TransactionOperation<TModel>[] = [];
    const aggregationPipeline: Record<string, any> = {};
    const updatedRelations: Record<
      string,
      Record<string, { collection: string; key: string; relation: any }[]>
    > = {};

    const $match = {
      [TRANSACTION_KEY]: transactionKey
    };
    for (const [key, rel] of Object.entries(this.relationFields)) {
      if (item[key]) {
        const operations = this.processRelationUpdate(item[key], $match, {
          ...rel,
          pushOperation: item[key]
        });
        relationOperations.push(...operations);

        operations.map((i) => {
          if (!updatedRelations[i.db]) {
            updatedRelations[i.db] = {};
          }
          if (!updatedRelations[i.db]![this.collection]) {
            updatedRelations[i.db]![this.collection] = [];
          }
          updatedRelations[i.db]![this.collection]!.push({
            collection: i.collection,
            key,
            relation: rel
          });
        });
      }
    }
    Object.entries(updatedRelations).forEach(([db, mainCollections]) => {
      aggregationPipeline[db] = [];
      const $lookup: any[] = [];
      const $group: Record<string, any> = {
        _id: null
      };
      const $project: Record<string, any> = {
        _id: 0
      };

      Object.values(mainCollections).map((relationArgs) => {
        relationArgs.map((r) => {
          $lookup.push({
            $lookup: {
              from: r.collection,
              pipeline: [
                {
                  $match: {
                    [TRANSACTION_KEY]: transactionKey
                  }
                },
                {
                  $project: {
                    _id: 1,
                    type: {
                      $literal: r.collection
                    }
                  }
                }
              ],
              as: r.collection
            }
          });
          $group[r.collection] = {
            $first: `$${r.collection}`
          };
          $project[r.collection] = {
            $map: {
              input: `$${r.collection}`,
              as: "token",
              in: "$$token._id"
            }
          };
        });
      });
      aggregationPipeline[db] = [{ $match }, ...$lookup, { $group }, { $project }];
    });

    return { relationOperations, aggregationPipeline, updatedRelations };
  }
  public generateWriteOperations(
    item: any,
    operation: "updateOne" | "updateMany",
    options: {
      where?: Record<string, any>;
      upsert?: boolean;
    } = {
      where: {},
      upsert: true
    },
    transactionId: ObjectId
  ): BulkWriteOperation<TModel>[] {
    if (!item._id) {
      item._id = item.id ? new ObjectId(item.id as string) : new ObjectId();
    }
    const { _id, id, ...$set } = item;
    const filter = options.where ? options.where : { _id };
    const { upsert } = options;
    const update: Record<string, any> = { $set };
    $set[TRANSACTION_KEY] = transactionId;
    if ($set.lastSave) {
      update.$setOnInsert = { firstSave: $set.lastSave };
    }

    Object.entries(this.relationFields).forEach(([key, relationField]) => {
      update.$setOnInsert[key] = relationField.array ? [] : null;
      delete $set[key];
    });
    return [
      {
        process: "bulkWrite",
        db: this.db,
        collection: this.collection,
        type: "main",
        stage: "saveRawRecord",
        order: 1,
        payload: [
          {
            [operation]: {
              filter,
              update,
              upsert
            }
          }
        ]
      } as unknown as BulkWriteOperation<TModel>
    ];
  }

  private generateDeleteManyOperation(where: QueryConditions<TModel>): BulkWriteOperation<TModel> {
    return {
      process: "bulkWrite",
      collection: this.collection,
      db: this.db,
      type: "main",
      order: 1,
      payload: [
        {
          deleteMany: { filter: normalizeFind(where, this.identifier.fields)! }
        }
      ]
    };
  }

  private generateCollectIdListOperation(where: QueryConditions<TModel>): AggregateOperation {
    return {
      process: "aggregate",
      collection: this.collection,
      db: this.db,
      order: 1,
      pipeline: [
        { $match: normalizeFind(where, this.identifier.fields) },
        {
          $group: {
            _id: null,
            idList: { $push: "$_id" }
          }
        },
        {
          $project: { _id: 0, idList: 1 }
        }
      ]
    };
  }

  private generateDisconnectOrDeleteRelationOperation(
    key: string,
    behaviour: DeleteRelationBehavior
  ): BulkWriteOperation<TModel> | undefined {
    const relationField = this.getRelationFieldOrThrow(key);
    if (
      relationField.args &&
      relationField.args.db &&
      relationField.args.collection &&
      relationField.args.field
    ) {
      const payload: AnyBulkWriteOperation<TModel>[] = [];
      if (behaviour === "delete") {
        payload.push({
          deleteMany: {
            filter: { [relationField.args.field]: { $in: { $collectedData: [0, "idList"] } } }
          }
        });
      } else if (behaviour === "disconnect") {
        payload.push({
          updateMany: {
            filter: { [relationField.args.field]: { $in: { $collectedData: [0, "idList"] } } },
            // @ts-ignore
            update: relationField.args.relation?.startsWith("Many")
              ? {
                  $pullAll: {
                    [relationField.args.field]: { $collectedData: [0, "idList"] }
                  }
                }
              : {
                  $set: {
                    [relationField.args.field]: null
                  }
                }
          }
        });
      }
      return {
        process: "bulkWrite",
        collection: relationField.collection,
        db: relationField.db,
        order: 1,
        type: "relation",
        payload
      };
    }
    return;
  }

  private getRelationFieldOrThrow(key: string) {
    const relationField = this.relationList.find((i) => i.name === key);
    if (!relationField) {
      const err = `Field ${key} is not a relation field`;
      this.logger?.error(err, ["remove"]);
      throw new Error(err);
    }
    return relationField;
  }

  private extractRelations() {
    return Object.entries(this.identifier.fields)
      .filter(([_, field]) => field?.args?.relation)
      .reduce((acc: Record<string, any>, [key, field]) => {
        acc[key] = {
          relation: field.args?.relation,
          to: field.args?.to,
          field: field.args?.field,
          collection: field.args?.collection,
          db: field.args?.db,
          array: field.array,
          relationFields: field.args?.relationFields,
          autoFields: field.args?.autoFields
        };
        return acc;
      }, {});
  }

  private extractAutoFields() {
    return Object.entries(this.identifier.fields)
      .filter(([_, field]) => field?.args?.auto)
      .reduce((acc: Record<string, FieldDefininition>, [key, field]) => {
        acc[key] = field;
        return acc;
      }, {});
  }

  private fillRelationList() {
    Object.entries(this.identifier.fields)
      .map(([_, value]) => value)
      .filter((i) => i.args?.relation)
      .map((i) => {
        this.relationList.push({
          ...i,
          db: this.identifier.collectionArgs?.dbName!,
          collection: this.identifier.collectionArgs?.collectionName!
        });
      });
  }
}
