import {
  AggregateRecord,
  Include,
  ModelBase,
  OmitRelations,
  QueryConditions,
  Select,
} from "./index";

export type PullParams<
  T extends ModelBase,
  S extends Select<T>,
  I extends Include<T>,
> = {
  where: QueryConditions<T>;
  skip?: number;
  limit?: number;
  sort?: {
    [K in keyof OmitRelations<T>]?: 1 | -1;
  };
  select?: S;
  include?: I;
};

export type PullQuery<T extends ModelBase> = <
  S extends Select<T>,
  I extends Include<T>,
>({
  where,
  skip,
  limit,
  sort,
  select,
  include,
}: PullParams<T, S, I>) => AggregateRecord;
