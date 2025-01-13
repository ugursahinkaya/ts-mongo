import {
  BulkWriteResult,
  DeleteParams,
  ModelBase,
} from "../query-builder/index";

export type DeleteReturn<TModel> = Promise<{
  error?: string;
  result?: BulkWriteResult<TModel>;
}>;

export type Delete<T extends ModelBase> = ({
  where,
}: DeleteParams<T>) => DeleteReturn<T>;
