import { isDate } from "util/types";
import { ObjectId } from "mongodb";

export function replaceCollectedDataValues(obj: any, source: any[]): any {
  for (const key in obj) {
    if (obj && key === "$collectedData") {
      obj = getValueByPath(source, obj[key]);
    }
    if (
      obj &&
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !ObjectId.isValid(obj[key]) &&
      !isDate(obj[key])
    ) {
      obj[key] = replaceCollectedDataValues(obj[key], source);
    }
  }
  return obj;
}
function getValueByPath(source: any[], path: (string | number)[]): any {
  let currentValue = source;
  for (const key of path) {
    if (currentValue === undefined || currentValue === null) {
      return undefined;
    }
    currentValue = currentValue[key as keyof typeof currentValue];
  }
  return currentValue;
}
