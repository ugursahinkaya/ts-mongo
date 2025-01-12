import { Lookup, PipelineObject } from "@ugursahinkaya/ts-mongo-types";

export function pipelineObjectToArray<TModel>(pipelineObject: PipelineObject<TModel>) {
  const pipeline: any[] = [];
  if (pipelineObject.match) {
    pipeline.push({ $match: pipelineObject.match });
  }
  if (pipelineObject.projection && Object.keys(pipelineObject.projection).length > 0) {
    pipeline.push({ $project: pipelineObject.projection });
  }
  if (pipelineObject.sort) {
    pipeline.push({ $sort: pipelineObject.sort });
  }
  if (pipelineObject.skip) {
    pipeline.push({ $skip: pipelineObject.skip });
  }
  if (pipelineObject.limit) {
    pipeline.push({ $limit: pipelineObject.limit });
  }
  if (pipelineObject.lookups) {
    pipelineObject.lookups.forEach((lookup: Lookup) => {
      if (pipelineObject.projection && pipelineObject.projection[lookup.as] === 1) {
        const lookupStage: any = {
          from: lookup.from,
          as: lookup.as,
          let: lookup.let
        };

        if (lookup.pipeline) {
          lookupStage.pipeline = lookup.pipeline;
        } else {
          lookupStage.localField = lookup.localField;
          lookupStage.foreignField = lookup.foreignField;
        }

        pipeline.push({ $lookup: lookupStage });
        if (!lookup.arrayRelation) {
          pipeline.push({
            $unwind: {
              path: `$${lookup.as}`,
              preserveNullAndEmptyArrays: true
            }
          });
        }
        if (lookup.$addFields) {
          if (!lookup.arrayRelation) {
            pipeline.push({
              $addFields: lookup.$addFields
            });
          } else {
            pipeline.push({
              $addFields: {
                [`${lookup.as}`]: {
                  $map: {
                    input: `$${lookup.as}`,
                    as: "itemValue",
                    in: {
                      $let: {
                        vars: {
                          newItem: {
                            $mergeObjects: ["$$itemValue", lookup.$addFields]
                          }
                        },
                        in: {
                          $arrayToObject: {
                            $filter: {
                              input: { $objectToArray: "$$newItem" },
                              as: "kv",
                              cond: { $ne: ["$$kv.k", "_id"] }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            });
          }
        }
        if (lookup.$project) {
          pipeline.push({
            $project: lookup.$project
          });
        }
      }
    });
  }
  pipeline.push({
    $addFields: { id: { $toString: "$_id" } }
  });
  pipeline.push({
    $project: { _id: 0 }
  });
  return pipeline;
}
