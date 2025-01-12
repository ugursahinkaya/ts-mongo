import {
  FieldDefininition,
  IncludeRelations,
  Lookup,
  PipelineObject
} from "@ugursahinkaya/ts-mongo-types";

export function generateLookups<TModel>(
  include: IncludeRelations<any>,
  fields: Record<string, FieldDefininition>
): PipelineObject<TModel> {
  const lookups: Lookup[] = [];

  for (const [relationFieldName, select] of Object.entries(include)) {
    const field = fields[relationFieldName];
    if (field && field.args?.collection && field.args?.field) {
      const lookup: Lookup = {
        as: field.name,
        from: field.args?.collection,
        arrayRelation: field.array,
        $addFields: {},
        $project: !field.array
          ? {
              [`${field.name}._id`]: 0
            }
          : undefined,
        let: {
          [`${field.name}Id`]: {
            $ifNull: [`$${field.name}`, field.array ? [] : null]
          }
        },
        pipeline: [
          {
            $match: {
              $expr: field.array
                ? {
                    $in: ["$_id", `$$${field.name}Id`]
                  }
                : {
                    $and: [
                      { $ne: [`$$${field.name}Id`, null] },
                      { $eq: ["$_id", `$$${field.name}Id`] }
                    ]
                  }
            }
          }
        ]
      };

      if (field.args.relationFields && field.args.relationFields.length > 0) {
        const $addFields: Record<string, any> = {};

        field.args.relationFields.forEach((r: [string, string, boolean]) => {
          $addFields.id = field.array ? { $toString: "$$itemValue._id" } : { $toString: "$_id" };
          if (r[2]) {
            if (field.array) {
              $addFields[`${r[0]}`] = {
                $map: {
                  input: { $ifNull: [`$$itemValue.${r[0]}`, []] },
                  as: `${r[0]}Id`,
                  in: {
                    $toString: `$$${r[0]}Id`
                  }
                }
              };
            } else {
              $addFields[`${field.name}.${r[0]}`] = {
                $map: {
                  input: { $ifNull: [`$${field.name}.${r[0]}`, []] },
                  as: `${r[0]}Id`,
                  in: {
                    $toString: `$$${r[0]}Id`
                  }
                }
              };
            }
          } else {
            if (field.array) {
              $addFields[`${r[0]}`] = {
                $cond: {
                  if: { $ifNull: [`$$itemValue.${r[0]}`, false] },
                  then: { $toString: `$$itemValue.${r[0]}` },
                  else: null
                }
              };
            } else {
              $addFields[`${r[0]}`] = {
                $map: {
                  input: { $ifNull: [`$${r[0]}`, []] },
                  as: `${r[0]}Id`,
                  in: {
                    $toString: `$$${r[0]}Id`
                  }
                }
              };
            }
          }
        });
        lookup.$addFields = $addFields;
      }

      if (select !== true && typeof select === "object" && Object.keys(select).length > 0) {
        lookup.pipeline!.push({ $project: select });
      }
      if (!field.array) {
        lookup.$unwind = {
          path: `$${field.name}`,
          preserveNullAndEmptyArrays: true
        };
      }

      lookups.push(lookup);
    }
  }
  return { lookups };
}
