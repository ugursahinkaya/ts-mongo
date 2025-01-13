import { useMongoClient } from "@ugursahinkaya/mongo-client";
import { User, identifier as userIdentifier } from "./models/User";
import { Article, identifier as articleIdentifier } from "./models/Article";
import { faker } from "@faker-js/faker";
export const identifiers = {
  User: userIdentifier,
  Article: articleIdentifier,
};
const models = {
  User: useMongoClient<User>(identifiers, "User", { logLevel: "trace" }),
  Article: useMongoClient<Article>(identifiers, "Article", {
    logLevel: "trace",
  }),
};

export async function addRandomUser() {
  await models.User.push({
    data: {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      userName: faker.internet.email(),
    },
    upsert: true,
  });
}

export async function getAllUsers() {
  return await models.User.pull({ where: {} });
}

export async function runClientTests() {
  await addRandomUser();
  await getAllUsers();
}
