import { FieldDefininition } from "@ugursahinkaya/ts-mongo-types";
import { ObjectId } from "bson";
import crypto from "crypto";
export function handleAutoField(
  item: Record<string, any>,
  key: keyof Record<string, any>,
  field: FieldDefininition
) {
  let value = item[key] as any;
  const now = new Date();
  if (field.args) {
    if (field.args.auto) {
      if (field.args.unique) {
        if (field.args.generator === "uuid") {
          value = value ?? crypto.randomUUID().replace(/-/g, "");
        }
      } else if (field.args.autoNow) {
        value = now;
      }
    } else if (field.args.map === "_id") {
      value = new ObjectId();
    }
  }
  if (!field.args?.autoNowAdd) {
    item[key] = value;
  }
}

/*


oldLoop(){
  items.forEach((item: any) => {
    assignObjectId(item);

    const { relationOperations, aggregationPipeline, updatedRelations } =
      this.generateRelationUpdateOperations0(item, transactionKey);

    if (relationOperations) {
      operations.push(...relationOperations);
    }
    if (!aggregationPipeline[this.db]) {
      aggregationPipeline[this.db] = [];
    }

    const mainOperation = this.generateWriteOperations(
      item,
      "updateMany",
      {
        where,
        upsert
      },
      transactionKey
    );
    operations.push(...mainOperation);
    Object.entries(aggregationPipeline).forEach(([_, pipeline]) => {
      operations.push({
        process: "aggregate",
        db: this.db,
        collection: this.collection,
        stage: "collect",
        order: 2,
        pipeline
      });
    });
    const pipelineLength = aggregationPipeline[this.db].length;
    aggregationPipeline[this.db][pipelineLength - 2].$group[this.collection] = {
      $first: `$${this.collection}`
    };
    aggregationPipeline[this.db][pipelineLength - 1].$project[this.collection] = {
      $map: {
        input: `$${this.collection}`,
        as: "token",
        in: "$$token._id"
      }
    };
    aggregationPipeline[this.db][0] = {
      $lookup: {
        from: this.collection,
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
                $literal: this.collection
              }
            }
          }
        ],
        as: this.collection
      }
    };
    aggregationPipeline[this.db].unshift({
      $match: {
        [TRANSACTION_KEY]: transactionKey
      }
    });

    const mainUpdate: Record<string, any> = {
      $unset: { [TRANSACTION_KEY]: 1 }
    };
    Object.entries(updatedRelations).forEach(([_db, mainCollections]) => {
      Object.entries(mainCollections).forEach(([mainCollection, relationArgs]) => {
        relationArgs.forEach((rel) => {
          const update: Record<string, any> = {
            $unset: { [TRANSACTION_KEY]: 1 }
          };
          if (rel.relation.relation.array) {
            update.$addToSet = {
              [rel.relation.field]: { $each: { $collectedData: [0, mainCollection] } }
            };
          } else {
            update.$set = {
              [rel.relation.field]: { $collectedData: [0, mainCollection, 0] }
            };
          }

          if (rel.relation.relation.endsWith("ToMany")) {
            if (!mainUpdate.$addToSet) {
              mainUpdate.$addToSet = {};
            }
            mainUpdate.$addToSet[rel.key] = {
              $each: { $collectedData: [0, rel.collection] }
            };
          } else {
            if (!mainUpdate.$set) {
              mainUpdate.$set = {};
            }
            mainUpdate.$set[rel.key] = { $collectedData: [0, rel.collection, 0] };
          }
      /-------
          operations.push({
            process: "bulkWrite",
            db: db,
            collection: rel.collection,
            stage: "saveRelations",
            order: 3,
            payload: [
              {
                [rel.relation.relation.endsWith("ToMany") ? "updateMany" : "updateOne"]: {
                  filter: {
                    _id: rel.relation.relation.endsWith("ToMany")
                      ? { $in: { $collectedData: [0, rel.collection] } }
                      : { $collectedData: [0, rel.collection, 0] }
                  },
                  update,
                  upsert: false
                }
              }
            ]
          } as unknown as TransactionOperation<TModel>);
              /-------

        });
      });
    });

    operations.push({
      process: "bulkWrite",
      db: this.db,
      collection: this.collection,
      stage: "saveRelations",
      type: "main",
      order: 3,
      payload: [
        {
          updateMany: {
            filter: { _id: { $in: { $collectedData: [0, this.collection] } } },
            update: mainUpdate,
            upsert: false
          }
        }
      ]
    });
  });
}

*/
