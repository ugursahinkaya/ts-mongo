import { ModelDefinition } from "@ugursahinkaya/ts-mongo-types";
import { assignObjectId } from "./helpers/assignObjectId";
import { processItemRelations } from "./helpers/processItemRelations";

export function generateTransactions(
  model: ModelDefinition<any>,
  items: any,
  relations: Record<string, any>
) {
  items = Array.isArray(items) ? items : [items];
  const transactions: any[] = [];
  items.forEach((item: any) => {
    assignObjectId(item);
    const itemRelations = processItemRelations(model, item, relations);
    transactions.push([item, itemRelations]);
  });
  return transactions;
}
