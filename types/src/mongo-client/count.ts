import { CountParams, ModelBase } from "../query-builder/index";

export type CountReturn = Promise<number>;

export type Count<T extends ModelBase> = ({
  where,
  skip,
  limit,
  sort,
}: CountParams<T>) => CountReturn;
