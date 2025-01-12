import {
  ModelBase,
  Delete,
  Get,
  Pull,
  Push,
  Count,
} from "@ugursahinkaya/ts-mongo-types";

export function useMongoClient<TModel extends ModelBase>() {
  async function fetchFromServer(method: string, data: Record<string, any>) {
    const body = JSON.stringify(data);
    return await fetch(`${method}`, {
      method: "POST",
      body,
    }).catch(() => {
      throw new Error("fetchFromServer");
    });
  }

  const get: Get<TModel> = async (payload) =>
    //@ts-expect-error return type is correct. No need to change it.
    await fetchFromServer("get", payload);

  const pull: Pull<TModel> = async (payload) =>
    //@ts-expect-error return type is correct. No need to change it.
    await fetchFromServer("pull", payload);

  const push: Push<TModel> = async (payload) =>
    //@ts-expect-error return type is correct. No need to change it.
    await fetchFromServer("pull", payload);

  const remove: Delete<TModel> = async (payload) =>
    //@ts-expect-error return type is correct. No need to change it.
    await fetchFromServer("remove", payload);

  const count: Count<TModel> = async (payload) =>
    //@ts-expect-error return type is correct. No need to change it.
    await fetchFromServer("count", payload);

  return { get, pull, push, delete: remove, count };
}
