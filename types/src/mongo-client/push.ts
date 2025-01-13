import {
  PushParams,
  ModelBase,
  PushData,
  QueryConditions,
  BulkWriteResult,
} from "../query-builder/index";

export type PushReturn<TModel extends ModelBase> =
  | BulkWriteResult<TModel>[]
  | {
      result?: BulkWriteResult<TModel>[];
      next: () => TModel | null;
      toArray: () => TModel[];
    }
  | {
      error: string;
    };

export type Push<TModel extends ModelBase> = <
  TData extends PushData<TModel>,
  TWhere extends TData extends Array<any> ? never : QueryConditions<TModel>,
>({
  data,
  where,
  upsert,
}: PushParams<TModel, TData, TWhere>) => Promise<PushReturn<TModel>>;
