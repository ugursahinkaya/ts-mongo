import { FieldDefininition, Projection } from "@ugursahinkaya/ts-mongo-types";

export function normalizeProjection<TModel extends Record<string, any> & { _id?: any }>(
  baseProjection: Projection<TModel>,
  fields: Record<string, FieldDefininition>,
  relationFieldKeys: (keyof TModel)[]
): Projection<TModel> {
  const includeFields: any[] = [];
  const userProjection = Object.fromEntries(
    Object.entries(baseProjection)
      .filter(([key]) => !relationFieldKeys.includes(key as TModel["$relationKeys"]))
      .map(([key, value]) => [key, !value ? 0 : 1])
  ) as Projection<TModel>;

  relationFieldKeys
    .filter((key) => baseProjection[key as keyof Projection<TModel>] !== 0)
    .forEach((key) => {
      includeFields.push(key);
    });

  const returnResult = (projection: Projection<TModel>) => {
    relationFieldKeys.map((key) => {
      if (includeFields.includes(key)) {
        //@ts-expect-error nothing to do
        projection[key] = 1;
      } else {
        delete projection[key as keyof Projection<TModel>];
      }
    });

    return projection;
  };

  const hasInclusion = Object.values(userProjection).some((value) => value === 1);
  const hasExclusion = Object.values(userProjection).some((value) => value === 0);

  if (hasInclusion && !hasExclusion) {
    return returnResult(userProjection);
  }
  if (!hasInclusion && hasExclusion) {
    const normalizedProjection: Projection<TModel> = {};
    Object.keys(fields).forEach((name) => {
      if (userProjection[name] !== 0 || name === "_id") {
        //@ts-expect-error nothing to do
        normalizedProjection[name] = 1;
      }
    });
    return returnResult(normalizedProjection);
  }
  if (hasInclusion && hasExclusion) {
    const normalizedProjection: Projection<TModel> = {};
    Object.entries(userProjection).forEach(([key, value]) => {
      if (key === "_id" && value === 0) {
        //@ts-expect-error nothing to do
        normalizedProjection[key] = 0;
      } else if (value === 1) {
        //@ts-expect-error nothing to do
        normalizedProjection[key] = 1;
      }
    });
    return returnResult(normalizedProjection);
  }
  return returnResult(
    Object.keys(fields).reduce((acc, field) => ({ ...acc, [field]: 1 }), {}) as Projection<TModel>
  );
}
