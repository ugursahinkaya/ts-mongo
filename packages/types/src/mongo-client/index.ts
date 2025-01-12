import {
  Include,
  ModelBase,
  PickIncluded,
  PickSelected,
  Select,
} from "../query-builder/index";

export type * from "./count";
export type * from "./get";
export type * from "./pull";
export type * from "./push";
export type * from "./delete";

export type ModelReturn<
  T extends ModelBase,
  S extends Select<T> | undefined = undefined,
  I extends Include<T> | undefined = undefined,
> = I extends undefined
  ? S extends undefined
    ? {
        [P in keyof S as S[P] extends never ? never : P]: P extends keyof T
          ? T[P]
          : never;
      }
    : PickSelected<T, S>
  : S extends undefined
    ? PickIncluded<T, I>
    : PickIncluded<T, I> & PickSelected<T, S>;

export type Aggregate<T extends ModelBase> = <
  S extends Select<T>,
  I extends Include<T>,
>(query: {
  operation: string;
  db: string;
  collection: string;
  pipeline: any[];
  args: Record<string, any>;
}) => Promise<ModelReturn<T, S, I>[]>;

export type Commit<T extends ModelBase> = <
  S extends Select<T>,
  I extends Include<T>,
>(query: {
  operation: "updateOne" | "updateMany" | "deleteMany";
  transactions: Record<string, Record<string, any[]>>;
}) => Promise<ModelReturn<T, S, I> | null>;
