import {
  AggregateRecord,
  Include,
  ModelBase,
  QueryConditions,
  Select,
} from "./index";

export type GetParams<
  T extends ModelBase,
  S extends Select<T> | undefined = undefined,
  I extends Include<T> | undefined = undefined,
> = {
  where: QueryConditions<T>;
  select?: S;
  include?: I;
};

export type GetQuery<T extends ModelBase> = <
  S extends Select<T>,
  I extends Include<T>,
>({
  where,
  select,
  include,
}: GetParams<T, S, I>) => AggregateRecord;
