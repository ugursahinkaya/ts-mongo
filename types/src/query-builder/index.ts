export type ArrayElement<T extends ModelBase[]> = T extends (infer U)[]
  ? U
  : never;
export type QueryOperators<T> = {
  $eq?: T;
  $ne?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $in?: T[];
  $nin?: T[];
  $every?: T[];
  $exists?: boolean;
  $regex?: RegExp | string;
  $size?: number;
  $all?: T[];
  $elemMatch?: QueryOperators<T>;
  $type?: string | number;
  $some?: T extends Array<any>
    ? Omit<OmitAutoFields<OmitRelations<ArrayElement<T>>>, HiddenFields>
    : never;
};
export type BulkWriteReturnType<TModel> = {
  db?: string;
  collection?: string;
  type?: string;
  upsertedCount?: number;
  upsertedIds?: string[];
  upsertedId?: string;
  upsertedItems?: TModel[];
  upsertedItem?: TModel;
  modifiedCount?: number;
  modifiedIds?: string[];
  modifiedId?: string;
  modifiedItems?: TModel[];
  modifiedItem?: TModel;
  insertedCount?: number;
  insertedIds?: string[];
  insertedId?: string;
  insertedItems?: TModel[];
  insertedItem?: TModel;
  deletedCount?: number;
  deletedIds?: string[];
  deletedId?: string;
  matchedCount?: number;
} & Record<string, any>;

export type BulkWriteResult<TModel> = {
  item?: BulkWriteReturnType<TModel>;
  items?: BulkWriteReturnType<TModel>;
  relations?: BulkWriteReturnType<TModel> & {
    name?: string;
    field?: string;
  };
};

export type IsObject<T> = T extends object
  ? T extends Array<any>
    ? undefined
    : true
  : false;

export type AtLeastOne<T, Keys extends keyof T = keyof T> = Partial<T> &
  { [K in Keys]: Required<Pick<T, K>> }[Keys];

export type Data<T> = T extends ModelBase ? PushData<T> : T;

export interface ConnectOption<T> {
  connect: QueryConditions<T> | QueryConditions<T>[];
  disconnect: never;
  set: never;
  upsert: never;
  update: never;
  delete: never;
}
export interface DisconnectOption<T> {
  disconnect: QueryConditions<T> | true;
  connect: never;
  set: never;
  upsert: never;
  update: never;
  delete: never;
}
export interface SetOption<T> {
  set: { where: QueryConditions<T>; oldRelations: "delete" | "disconnect" };
  connect: never;
  disconnect: never;
  upsert: never;
  update: never;
  delete: never;
}
export interface UpsertOption<T> {
  upsert: { data: Data<T> | Data<T>[]; oldRelations: "delete" | "disconnect" };
  connect: never;
  disconnect: never;
  set: never;
  update: never;
  delete: never;
}
export interface UpdateOption<T> {
  update: {
    data: Data<T>;
    where: QueryConditions<T>;
  };
  connect: never;
  disconnect: never;
  set: never;
  upsert: never;
  delete: never;
}
export interface DeleteOption<T> {
  delete: QueryConditions<T> | true;
  connect: never;
  disconnect: never;
  set: never;
  upsert: never;
  update: never;
}

export type RelationPush<T> = Partial<
  | ConnectOption<T>
  | DisconnectOption<T>
  | SetOption<T>
  | UpsertOption<T>
  | UpdateOption<T>
  | DeleteOption<T>
>;

export type OptionalKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];

export type PushDataElement<T extends ModelBase> = {
  [P in Exclude<
    OptionalKeys<T>,
    T["$autoFields"] | HiddenFields
  >]?: P extends keyof T
    ? P extends T["$relationFields"]
      ? ArrayElement<T[P]> extends never
        ? RelationPush<T[P]>
        : RelationPush<ArrayElement<T[P]>>
      : P extends keyof T
        ? T[P]
        : never
    : never;
} & {
  [P in Exclude<
    keyof T,
    OptionalKeys<T> | T["$autoFields"] | HiddenFields
  >]: P extends keyof T
    ? P extends T["$relationFields"]
      ? ArrayElement<T[P]> extends never
        ? RelationPush<T[P]>
        : RelationPush<ArrayElement<T[P]>>
      : P extends keyof T
        ? T[P]
        : never
    : never;
};
export type PushData<T extends ModelBase> =
  | PushDataElement<T>
  | PushDataElement<T>[];

export type QueryConditions<T> = {
  [P in keyof T]?: T[P] extends object
    ? QueryConditions<T[P]> | QueryOperators<T[P]>
    : QueryOperators<T[P]> | Partial<T[P]>;
};

export type PushConditions<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Array<any>
      ? ArrayElement<T[P]>[]
      : PushConditions<T[P]>
    : T[P];
};

export type PickSelected<T, S> = {
  [P in keyof S as S[P] extends false | undefined
    ? never
    : P]: P extends keyof T ? T[P] : never;
};

export type PickIncluded<T, I> = {
  [P in keyof I]: P extends keyof T
    ? I[P] extends true
      ? T[P]
      : T[P] extends Array<any>
        ? PickSelected<ArrayElement<T[P]>, I[P]>[]
        : PickSelected<T[P], I[P]>
    : never;
};

export type FieldDefininition = {
  name: string;
  type: string;
  args?: {
    [key: string]: any;
    relation?: any;
    to?: string;
    field?: string;
    collection?: string;
    db?: string;
  };
  array?: boolean;
};
export type ModelDefinition<T> = {
  collectionArgs: {
    dbName: string;
    collectionName: string;
  };
  fields: Record<
    Exclude<keyof T, "$relationFields" | "$autoFields">,
    FieldDefininition
  >;
};

export type ProjectionKey<T> = T | "_id";

export type Projection<T> = {
  [I in ProjectionKey<T> as string]?: 1 | 0;
};

export type Sort = Record<string, 1 | -1>;

export type Lookup = {
  as: string;
  from: string;
  $addFields?: Record<string, any>;
  $project?: Record<string, any>;
  $unwind?: Record<string, any>;
  arrayRelation?: boolean;
  let?: Record<string, any>;
  localField?: string;
  foreignField?: string;
  pipeline?: any[];
};
export type DeleteRelationBehavior = "delete" | "disconnect";
export type PipelineObject<T> = {
  limit?: number;
  skip?: number;
  sort?: Sort;
  projection?: Projection<T>;
  match?: Record<string, any>;
  lookups?: Lookup[];
};
export type BulkWritePayload<TModel> = {
  filter: Record<string, any>;
  upsert?: boolean;
  update?: {
    $set?: Partial<Omit<TModel, "_id" | "id">>;
    $unset?: Partial<Record<keyof TModel, "">>;
    $inc?: Partial<Record<keyof TModel, number>>;
    $mul?: Partial<Record<keyof TModel, number>>;
    $min?: Partial<Record<keyof TModel, number>>;
    $max?: Partial<Record<keyof TModel, number>>;
    $rename?: Record<string, keyof TModel>;
    $currentDate?: Partial<
      Record<keyof TModel, true | { $type: "timestamp" | "date" }>
    >;
    $push?: Partial<Record<keyof TModel, any>>;
    $addToSet?: Partial<Record<keyof TModel, any>>;
    $pop?: Partial<Record<keyof TModel, 1 | -1>>;
    $pull?: Partial<Record<keyof TModel, any>>;
    $pullAll?: Partial<Record<keyof TModel, any[]>>;
  };
};

export type AnyBulkWriteOperation<TModel> = Partial<{
  insertOne: BulkWritePayload<TModel>;
  replaceOne: BulkWritePayload<TModel>;
  updateOne: BulkWritePayload<TModel>;
  updateMany: BulkWritePayload<TModel>;
  deleteOne: BulkWritePayload<TModel>;
  deleteMany: BulkWritePayload<TModel>;
}>;

export type BulkWriteOperation<TModel> = {
  db: string;
  collection: string;
  type: "main" | "relation";
  stage?: string;
  payload: AnyBulkWriteOperation<TModel>[];
  process: "bulkWrite";
  order: number;
  expect?: Record<string, any>[];
};

export type AggregateOperation = {
  db: string;
  collection: string;
  stage?: string;
  pipeline: any[];
  order: number;
  process: "aggregate";
  expect?: Record<string, any>[];
};

export type TransactionOperation<TModel> =
  | BulkWriteOperation<TModel>
  | AggregateOperation;

export type AggregateRecord = {
  operation: string;
  db: string;
  collection: string;
  pipeline: any[];
  args?: Record<string, any>;
};
export type HiddenFields = "$relationFields" | "$autoFields";

export type BaseType<T extends ModelBase> = Omit<
  T,
  T["$autoFields"] extends keyof T
    ? T["$autoFields"] | HiddenFields
    : HiddenFields
>;

export type Select<T extends ModelBase> = {
  [P in Exclude<keyof T, HiddenFields>]?: 1 | 0;
};

export type Include<T extends ModelBase> = T["$relationFields"] extends never
  ? undefined
  : IncludeRelations<T>;

export type IncludeRelations<T> = {
  [P in T extends ModelBase
    ? T["$relationFields"] extends never
      ? keyof T
      : T["$relationFields"]
    : keyof T]?: T[P] extends object
    ? T[P] extends Array<any>
      ? IncludeRelations<ArrayElement<T[P]>> | true
      : IncludeRelations<T[P]> | true
    : true;
};

export type OmitRelations<T> = T extends ModelBase
  ? T["$relationFields"] extends undefined
    ? T
    : T["$relationFields"] extends keyof T
      ? Omit<T, T["$relationFields"]>
      : T
  : T;

export type OmitAutoFields<T> = T extends ModelBase
  ? T["$autoFields"] extends undefined
    ? T
    : T["$autoFields"] extends keyof T
      ? Omit<T, T["$autoFields"]>
      : T
  : T;

export type ModelBase = {
  //[key: string]: any;
  _id?: any;
  $relationFields?: any;
  $autoFields?: any;
};

export type * from "./count";
export type * from "./get";
export type * from "./pull";
export type * from "./push";
export type * from "./delete";
