import { TransactionOperation, ModelBase, QueryConditions } from "./index";

export type DeleteParams<T extends ModelBase> = {
  where: QueryConditions<T>;
} & { [key in T["$relationFields"]]: "disconnect" | "delete" };

export type DeleteQuery<T extends ModelBase> = ({
  where,
}: DeleteParams<T>) => TransactionOperation<T>[];
