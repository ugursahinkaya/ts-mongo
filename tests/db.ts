import type {
  Relation,
  Field,
  Collection,
} from "@ugursahinkaya/ts-mongo-types";

export interface User
  extends Collection<{
    dbName: "blog-test";
    collectionName: "user";
  }> {
  userName: Field.String;
  firstName: Field.String;
  lastName: Field.String;
  password?: Field.String;
  articles?: Relation.OneToMany<Article, "owner">;
}

export interface Article
  extends Collection<{
    dbName: "blog-test";
    collectionName: "article";
  }> {
  token: Field.Unique<{ generator: "uuid"; type: "string" }>;
  title: Field.String;
  content: Field.String;
  tags: Field.Tag;
  owner?: Relation.ManyToOne<User, "articles">;
}
