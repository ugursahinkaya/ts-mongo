import { QueryBuilder } from "@ugursahinkaya/query-builder";
import { User, identifier as userIdentifier } from "./models/User";
import { Article, identifier as articleIdentifier } from "./models/Article";
const user = QueryBuilder<User>({
  logLevel: "trace",
  modelName: "User",
  identifiers: { User: userIdentifier },
});
const article = QueryBuilder<Article>({
  logLevel: "trace",
  modelName: "Article",
  identifiers: { Article: articleIdentifier },
});

user.pull({
  where: { firstName: "Deneme", lastName: "lastName", userName: "userName" },
  select: { password: 1 },
});

article.pull({
  where: {},
  select: { owner: 1, tags: 1 },
});
