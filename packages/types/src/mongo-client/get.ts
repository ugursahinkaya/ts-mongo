import { GetParams, Include, ModelBase, Select } from "../query-builder/index";
import { ModelReturn } from "./index";

export type GetReturn<
  T extends ModelBase,
  S extends Select<T> | undefined,
  I extends Include<T> | undefined,
> = Promise<{
  item: ModelReturn<T, S, I>;
  totalCount?: number;
}>;

export type Get<T extends ModelBase> = <
  S extends Select<T> | undefined,
  I extends Include<T> | undefined,
>({
  where,
  select,
  include,
}: GetParams<T, S, I>) => GetReturn<T, S, I>;
