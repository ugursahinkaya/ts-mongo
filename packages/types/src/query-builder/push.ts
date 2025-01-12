import {
  ModelBase,
  QueryConditions,
  PushData,
  TransactionOperation,
} from "./index";
export type PushParams<
  T extends ModelBase,
  TData extends PushData<T> | PushData<T>[],
  TWhere extends TData extends Array<any> ? never : QueryConditions<T>,
> = {
  data: TData extends Array<any>
    ? TData
    : TWhere extends undefined | never
      ? TData
      : Partial<TData>;
  where?: TData extends Array<any> ? never : TWhere;
  upsert?: boolean;
};
export type PushQuery<T extends ModelBase> = <
  TData extends PushData<T> | PushData<T>[],
  TWhere extends TData extends Array<any> ? never : QueryConditions<T>,
>({
  data,
  where,
  upsert,
}: PushParams<T, TData, TWhere>) => TransactionOperation<T>[];
