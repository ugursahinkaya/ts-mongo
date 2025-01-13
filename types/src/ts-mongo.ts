/**
 * Default type that can be nullable.
 * @example
 * type NullableString = DefaultType<string>; // string | null
 */
type DefaultType<Type> = Type | null;

/**
 * UI arguments used for defining component and its props.
 * @example
 * uiArgs: UIArgs = {
 *   component: 'q-input',
 *   from: 'quasar',
 *   props: {
 *     type: 'text',
 *     label: 'Enter name',
 *     outlined: true
 *   }
 * }
 */
export type UIArgs = {
  /** The component to be used in the UI */
  component?: string;
  /** The module import for the component */
  from?: string;
  /** The properties to be passed to the UI component */
  props?: Record<string, any>;
};

export type EventNames =
  | "before:save"
  | "after:save"
  | "before:delete"
  | "after:delete"
  | "before:get"
  | "after:get"
  | "before:pull"
  | "after:pull"
  | "middleware"
  | "middleware:read"
  | "middleware:write"
  | "activate"
  | "deactivate"
  | "interval"
  | "timeout";
/**
 * Event arguments used for defining event processing, payload, and resolve/reject logic.
 * @example
 * eventArgs: EventArgs = {
 *   onSubmit: {
 *     process: 'submitForm',
 *     payload: { formId: 'loginForm' },
 *     resolve: { process: 'onSuccess', payload: {} },
 *     reject: { process: 'onError', payload: { message: 'Submission failed' } }
 *   }
 * }
 */

export type EventArgs = {
  [K in EventNames]?: [
    {
      /** The name of the process */
      process: string;
      /** The payload to be passed with the process */
      payload?: Record<string, any>;
      /** The resolve action upon successful process completion */
      resolve?: {
        process: string;
        payload?: Record<string, any>;
      };
      /** The reject action upon process failure */
      reject?: {
        process: string;
        payload?: Record<string, any>;
      };
    },
  ];
};

/**
 * Defines a model field with its name, type, and optional arguments.
 * @example
 * nameField: ModelField = {
 *   name: "username",
 *   type: "string",
 *   args: {
 *     minLength: 3,
 *     maxLength: 30,
 *     ui: {
 *       component: 'q-input',
 *       props: {
 *         label: 'Username',
 *         placeholder: 'Enter your username',
 *         outlined: true,
 *         type: 'text'
 *       }
 *     }
 *   }
 * }
 */
export type ModelField = {
  /** The name of the field */
  name: string;
  /** The type of the field as a string */
  type: string;
  /** Marks the field as an array */
  array?: boolean;
  typeArgs?: any;

  /** Additional arguments for the field */
  args?: {
    typeText?: string;
    auto?: boolean;
    object?: boolean;
    type?: string;
    /** relation name for relation */
    relationName?: string;
    /** db name for relation */
    db?: string;
    /** collection name for relation */
    collection?: string;
    /** Object Field keys */
    keys?: string[];
    /** Whether the field is optional */
    optional?: boolean;
    /** Whether the field is read-only */
    readonly?: boolean;
    /** Whether the field is a primary key */
    primaryKey?: boolean;
    /** Maps the field to a different name */
    map?: string;
    /** Default value for the field */
    default?: any;
    /** Whether the field is used as a tag */
    tag?: boolean;
    /** Whether the field auto increments */
    autoIncrement?: boolean;
    /** Whether the field should be a slug */
    slug?: boolean;
    /** Field to use for generating slug */
    from?: string;
    /** Additional options for the field */
    options?: Record<string, any>;
    /** Automatically set the current timestamp on creation */
    autoNowAdd?: boolean;
    /** Automatically update the current timestamp */
    autoNow?: boolean;
    /** Relation type for the field */
    relation?: string;
    /** Target model for relations */
    to?: string;
    /** Field used in relations */
    field?: string;
    /** Maximum length of the field value */
    maxLength?: number;
    /** Minimum length of the field value */
    minLength?: number;
    /** Maximum value for numeric fields */
    max?: number;
    /** Minimum value for numeric fields */
    min?: number;
    /** Generator function or method */
    generator?: string;
    /** Marks the field as a file type */
    file?: boolean;
    /** Whether the field value must be unique */
    unique?: boolean;
    /** Scope for JavaScript type fields */
    scope?: Record<string, any>;
    /** Marks the field as a 128-bit number */
    "128bit"?: boolean;
    /** Marks the field as a 64-bit number */
    "64bit"?: boolean;
    /** Marks the field as an ObjectId */
    ObjectId?: boolean;
    relationFields?: [key: string, relationType: string, array: boolean][];
    autoFields?: [key: string, args: Record<string, any>][];
  } & Field.FileArgs &
    Field.ImageArgs;
};

/**
 * Model Identifier representing a collection model's name, fields, and optional events and collection arguments.
 * @example
 * userModel: ModelIdentifier = {
 *   name: "User",
 *   fields: {
 *     username: { name: "username", type: "string", args: {
 *       minLength: 3,
 *       maxLength: 30,
 *       ui: {
 *         component: 'q-input',
 *         props: {
 *           label: 'Username',
 *           placeholder: 'Enter your username',
 *           outlined: true,
 *           type: 'text'
 *         }
 *       }
 *     }},
 *     age: { name: "age", type: "int", args: {
 *       min: 18,
 *       max: 120,
 *       ui: {
 *         component: 'q-input',
 *         props: {
 *           label: 'Age',
 *           type: 'number',
 *           outlined: true
 *         }
 *       }
 *     } }
 *   }
 * }
 */

export type ModelIdentifier = {
  /** The name of the model */
  name: string;
  /** The fields of the model */
  fields: Record<string, ModelField>;
  /** Optional event arguments */
  events?: EventArgs;
  /** Optional collection arguments */
  collectionArgs?: CollectionArgs;
  relationFields?: [key: string, relationType: string, array: boolean][];
  autoFields?: [key: string, args: Record<string, any>][];
};

/**
 * Collection arguments including database name, collection name, events, and indexing options.
 * @example
 * collectionArgs: CollectionArgs = {
 *   dbName: 'myApp',
 *   collectionName: 'users',
 *   indexes: {
 *     usernameIndex: {
 *       keys: { username: 1 },
 *       unique: true
 *     }
 *   }
 * }
 */
export type CollectionArgs = {
  dbName?: string;
  collectionName?: string;
  events?: EventArgs;
  indexes?: Record<
    string,
    {
      keys: Record<string, number>;
      unique?: boolean;
      sparse?: boolean;
      buildInBackground?: boolean;
      expireAfterSeconds?: number;
      textSearch?: {
        defaultLanguage: string;
        languageOverride: string;
        weights: Record<string, number>;
      };
    }
  >;
};

/**
 * Namespace for defining relation types between models.
 */
export declare namespace Relation {
  type Single<
    Model,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model>;
    args: Args;
  };

  type Many<
    Model,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model[]>;
    args: Args;
  };

  /**
   * One-to-many relationship between models.
   * @example
   * relation: Relation.OneToMany<Post, 'author'>
   */
  type OneToMany<
    Model,
    ForeignKey extends keyof ManyToOneRelations<Model>,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model[]>;
    field: ForeignKey;
    args: Args;
  };

  /**
   * Many-to-one relationship between models.
   * @example
   * relation: Relation.ManyToOne<User, 'posts'>
   */
  type ManyToOne<
    Model,
    ForeignKey extends keyof OneToManyRelations<Model>,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model>;
    field: ForeignKey;
    args: Args;
  };

  /**
   * Many-to-many relationship between models.
   * @example
   * relation: Relation.ManyToMany<User, 'friends'>
   */
  type ManyToMany<
    Model,
    ForeignKey extends keyof ManyToManyRelations<Model>,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model[]>;
    field: ForeignKey;
    args: Args;
  };

  /**
   * One-to-one relationship between models.
   * @example
   * relation: Relation.OneToOne<User, 'profile'>
   */
  type OneToOne<
    Model,
    ForeignKey extends keyof OneToOneRelations<Model>,
    Args extends
      | {
          ui?: UIArgs;
          relationName?: string;
        }
      | never = never,
  > = {
    model: Readonly<Model>;
    field: ForeignKey;
    args: Args;
  };
}
export declare namespace Field {
  /**
   * Field for storing a timestamp value.
   * @example
   * timestampField: Field.Timestamp<{ ui: { component: 'q-date', props: { mask: 'YYYY-MM-DD', format: 'date' } } }>
   */
  type Timestamp<
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: number;
    args: Args;
  };

  /**
   * Field for storing a boolean value.
   * @example
   * activeField: Field.Boolean<{ ui: { component: 'q-toggle', props: { label: 'Active' } } }>
   */
  type Boolean<
    Args extends
      | {
          default?: boolean;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: boolean;
    default: Args["default"];
    args: Args;
  };

  /**
   * Field for storing an array of items.
   * @example
   * tagsField: Field.Array<string, { ui: { component: 'q-select', props: { multiple: true, options: tagOptions } } }>
   */
  type Array<
    Type,
    Args extends
      | {
          minItems?: number;
          maxItems?: number;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: Type[];
    args: Args;
  };

  /**
   * Field for storing an object.
   * @example
   * addressField: Field.Object<{ street: string; city: string }, { ui: { component: 'q-input', props: { label: 'Address' } } }>
   */
  type Object<
    Type extends Record<string, any>,
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: Type;
    args: Args;
  };

  /**
   * Field for storing a JSON object.
   * @example
   * jsonDataField: Field.Json<{ ui: { component: 'q-editor', props: { placeholder: 'Enter JSON data' } } }>
   */
  type Json<
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: Record<string, any>;
    args: Args;
  };

  /**
   * Field for storing a DateTime value.
   * @example
   * dateTimeField: Field.DateTime<{ ui: { component: 'q-date', props: { mask: 'YYYY-MM-DD', format: 'date' } } }>
   */
  type DateTime<
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: Date;
    args: Args;
  };

  /**
   * Field for storing an integer value.
   * @example
   * ageField: Field.Int<{ max: 100, min: 18, default: 21, ui: { component: 'q-input', props: { type: 'number', label: 'Age' } } }>
   */
  type Int<
    Args extends
      | {
          "64it"?: boolean;
          max?: number;
          min?: number;
          default?: number;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: number;
    default: Args["default"];
    args: Args;
  };

  /**
   * Field for storing a decimal value.
   * @example
   * priceField: Field.Decimal<{ max: 10000, min: 0, default: 99.99, ui: { component: 'q-input', props: { type: 'number', label: 'Price' } } }>
   */
  type Decimal<
    Args extends
      | {
          "128bit"?: boolean;
          max?: number;
          min?: number;
          default?: number;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: number;
    default: Args["default"];
    args: Args;
  };

  /**
   * Field for storing a regular expression.
   * @example
   * regexField: Field.Regex<{ ui: { component: 'q-input', props: { label: 'Regex Pattern' } } }>
   */
  type Regex<
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: string;
    args: Args;
  };

  /**
   * Field for storing JavaScript code, with optional scope arguments.
   * @example
   * jsCodeField: Field.JS<{ scope: { context: 'browser' }, ui: { component: 'q-editor', props: { placeholder: 'Enter JavaScript code' } } }>
   */
  type JS<
    Args extends
      | {
          scope?: Record<string, any>;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: string;
    args: Args;
  };

  /**
   * File field arguments, such as accept types, max file size, and upload folder.
   * @example
   * fileArgs: Field.FileArgs = {
   *   accept: 'image/*',
   *   maxFileSize: 1048576,
   *   uploadFolderName: 'uploads',
   *   hashFileName: true
   * }
   */
  type FileArgs = {
    ui?: UIArgs;
    accept?: string;
    maxFileSize?: number;
    maxTotalSize?: number;
    maxFiles?: number;
    multiple?: boolean;
    hashFileName?: boolean;
    fileNameSuffix?: string;
    uploadFolderName?: string;
    visibility?: {
      public: boolean;
      host?: string;
    }[];
  };

  /**
   * Field for uploading files.
   * @example
   * profilePictureField: Field.File<{ ui: { component: 'q-file', props: { label: 'Upload Profile Picture' } } }>
   */
  type File<Args extends FileArgs | never = never> = {
    value: Args extends { multiple: true } ? string[] : string;
    args: Args;
  };

  /**
   * Arguments for handling image files.
   * @example
   * imageArgs: Field.ImageArgs = {
   *   convert: { type: 'webp', quality: 80 },
   *   thumbnail: {
   *     small: { scale: 0.25, fileNameSuffix: '_small', convert: 'webp' },
   *     large: { scale: 1.0, fileNameSuffix: '_large', convert: 'webp' }
   *   }
   * }
   */
  type ImageArgs = FileArgs & {
    convert?: {
      type: "webp" | "jpeg" | "png";
      quality: number;
    };
    thumbnail?: Record<
      string,
      {
        convert?: "webp" | "jpeg" | "png";
        crop?: {
          width: number;
          height: number;
        };
        scale?: number;
        quality: number;
        fileNameSuffix?: string;
      }
    >;
  };

  /**
   * Field for storing images.
   * @example
   * imageField: Field.Image<{ ui: { component: 'q-file', props: { label: 'Upload Image' } } }>
   */
  type Image<Args extends ImageArgs | never = never> = {
    value: Args extends { thumbnail: Record<string, any> }
      ? Record<keyof Args["thumbnail"] & "original", string>
      : string;
    args: Args;
  };

  /**
   * Field for storing tags.
   * @example
   * tagsField: Field.Tag<{ ui: { component: 'q-select', props: { multiple: true } } }>
   */
  type Tag<Args extends { ui: UIArgs } | never = never> = {
    value: string[];
    args: Args;
  };

  /**
   * Field for automatic calculation of a value based on a process.
   * @example
   * calculatedField: Field.Calculation<number, 'calculateTax', { ui: { component: 'q-input', props: { label: 'Tax Amount' } } }>
   */
  type Calculation<
    Type,
    Process extends string,
    Args extends { ui: UIArgs } | never = never,
  > = {
    value: Type;
    process: Process;
    args: Args;
  };

  /**
   * Field for storing automatically generated values.
   * @example
   * slugField: Field.Auto<string, { type: 'slug', from: 'title' }, { ui: { component: 'q-input', props: { label: 'Slug' } } }>
   */
  type Auto<
    Type,
    Process extends Type extends Date
      ? "AutoNow" | "AutoNowAdd"
      : Type extends number
        ? "Increment" | "TimestampNow" | "TimestampAdd"
        : Type extends string
          ? { type: "slug"; from: string }
          : never,
    Args extends { ui: UIArgs } | never = never,
  > = {
    value: Type;
    process: Process;
    args: { readonly: true & Args };
  };

  /**
   * Field for storing a string value.
   * @example
   * nameField: Field.String<{ minLength: 3, maxLength: 50, ui: { component: 'q-input', props: { label: 'Name' } } }>
   */
  type String<
    Args extends
      | { ui?: UIArgs; minLength?: number; maxLength?: number }
      | never = never,
  > = {
    value: string;
    args: Args;
  };

  /**
   * Field for storing a primary key.
   * @example
   * userIdField: Field.PrimaryKey<string, { ObjectId: true, map: 'user_id', ui: { component: 'q-input', props: { label: 'User ID' } } }>
   */
  type PrimaryKey<
    Type,
    Args extends
      | {
          ObjectId?: boolean;
          map?: string;
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: Type;
    args: { readonly: true & Args };
  };

  /**
   * Field for storing unique values with an optional generator.
   * @example
   * emailField: Field.Unique<string, { generator: 'uuid', ui: { component: 'q-input', props: { label: 'Email' } } }>
   */
  type Unique<
    Type,
    Args extends
      | {
          ui?: UIArgs;
          generator?: string;
        }
      | never = never,
  > = {
    value: Type;
    args: Args;
  };

  /**
   * Field for defining choices from a set of options.
   * @example
   * roleField: Field.Choices<string, { admin: 'Admin'; user: 'User'; guest: 'Guest' }, 'user', { ui: { component: 'q-select', props: { options: roleOptions } } }>
   */
  type Choices<
    Choices extends Record<string, any>,
    Default extends DefaultType<keyof Choices>,
    Args extends
      | {
          ui?: UIArgs;
        }
      | never = never,
  > = {
    value: keyof Choices;
    default: Default;
    args: Args;
  };
}

type ExtractRelations<T> =
  T extends Relation.OneToMany<infer R, any, any>
    ? Readonly<DbRecord<R>[]>
    : T extends Relation.ManyToOne<infer R, any, any>
      ? Readonly<DbRecord<R>>
      : T extends Relation.ManyToMany<infer R, any, any>
        ? Readonly<DbRecord<R>[]>
        : T extends Relation.OneToOne<infer R, any, any>
          ? Readonly<DbRecord<R>>
          : never;

type ExtractOneToManyRelations<T> =
  T extends Relation.OneToMany<infer R, any, any>
    ? Readonly<DbRecord<R>[]>
    : never;
type ExtractManyToOneRelations<T> =
  T extends Relation.ManyToOne<infer R, any, any>
    ? Readonly<DbRecord<R>>
    : never;
type ExtractManyToManyRelations<T> =
  T extends Relation.ManyToMany<infer R, any, any>
    ? Readonly<DbRecord<R>[]>
    : never;
type ExtractOneToOneRelations<T> =
  T extends Relation.OneToOne<infer R, any, any>
    ? Readonly<DbRecord<R>>
    : never;

type RelationFilter<T> = {
  [K in keyof T]: ExtractRelations<T[K]>;
};
type NoNeverOrUndefined<T> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends never | undefined ? never : K;
  }[keyof T]
>;
export type Relations<T> = NoNeverOrUndefined<RelationFilter<T>>;

export type OneToManyRelations<T> = NoNeverOrUndefined<{
  [K in keyof T]: ExtractOneToManyRelations<T[K]>;
}>;
export type ManyToOneRelations<T> = NoNeverOrUndefined<{
  [K in keyof T]: ExtractManyToOneRelations<T[K]>;
}>;
export type ManyToManyRelations<T> = NoNeverOrUndefined<{
  [K in keyof T]: ExtractManyToManyRelations<T[K]>;
}>;
export type OneToOneRelations<T> = NoNeverOrUndefined<{
  [K in keyof T]: ExtractOneToOneRelations<T[K]>;
}>;
type ExtractFieldType<T> = T extends {
  value: infer V;
}
  ? V
  : ExtractRelations<T>;
export type FieldValues<T> = {
  [K in keyof T]: ExtractFieldType<T[K]>;
};
export type DbRecord<T> = FieldValues<T & Collection> & {
  id: string;
};

type ExtractEditable<T> = T extends {
  value: infer V;
}
  ? T extends {
      args: never;
    }
    ? V
    : T extends { args: { readonly: true } }
      ? never
      : T extends { args: { thumbnail: Record<string, any> } }
        ? Partial<
            Record<keyof T["args"]["thumbnail"] | "original", Readonly<string>>
          > & {
            original: string;
          }
        : T extends { args: { options: Record<string, any> } }
          ? Record<keyof T["args"]["options"], any>
          : V
  : never;
export type Editable<T> = NoNeverOrUndefined<{
  [K in keyof T]: ExtractEditable<T[K]>;
}>;
export interface Collection<Args extends CollectionArgs | never = never> {
  readonly $collectionArgs?: Args;
  readonly $relationFields?: string;
  readonly $autoFields?: string;
  id: Field.PrimaryKey<
    string,
    {
      map: "_id";
      ObjectId: true;
    }
  >;
  firstSave: Field.Auto<Date, "AutoNowAdd">;
  lastSave: Field.Auto<Date, "AutoNow">;
}
