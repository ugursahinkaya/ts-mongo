import {
  AggregateRecord,
  ModelBase,
  QueryConditions,
  OmitRelations,
} from "./index";

export type CountParams<T extends ModelBase> = {
  where: QueryConditions<T>;
  skip?: number;
  limit?: number;
  sort?: {
    [K in keyof OmitRelations<T>]?: 1 | -1;
  };
};

export type CountQuery<T extends ModelBase> = ({
  where,
  skip,
  limit,
  sort,
}: CountParams<T>) => AggregateRecord;
