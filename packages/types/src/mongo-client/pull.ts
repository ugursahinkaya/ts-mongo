import {
  PullParams,
  Include,
  ModelBase,
  OmitRelations,
  Select,
} from "../query-builder/index";
import { ModelReturn } from "./index";

export type Pagination<T extends ModelBase> = {
  sort: Record<keyof OmitRelations<T>, 1 | -1>;
  page: number;
  rowsPerPage: number;
  totalItemCount: number;
  totalPageCount: number;
  firstItemIndex: number;
  lastItemIndex: number;
};

export type PullReturn<
  T extends ModelBase,
  S extends Select<T> | undefined = undefined,
  I extends Include<T> | undefined = undefined,
> = Promise<{
  list: ModelReturn<T, S, I>[];
  pagination?: Pagination<T>;
}>;

export type Pull<T extends ModelBase> = <
  S extends Select<T>,
  I extends Include<T>,
>({
  where,
  skip,
  limit,
  sort,
  select,
  include,
}: PullParams<T, S, I>) => PullReturn<T, S, I>;
