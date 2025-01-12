import { getFromObject } from "./getFromObject";

/**
 * Processes a specific condition type.
 */
export function processCondition(type: string, conditions: any, source: any): boolean {
  switch (type) {
    case "or":
      return conditions.some(({ selector, condition }: any) =>
        validateCondition(getFromObject(source, selector), condition)
      );
    case "and":
      return conditions.every(({ selector, condition }: any) =>
        validateCondition(getFromObject(source, selector), condition)
      );
    case "not":
      return !validateCondition(getFromObject(source, conditions.selector), conditions.condition);
    case "nor":
      return !conditions.some(({ selector, condition }: any) =>
        validateCondition(getFromObject(source, selector), condition)
      );
    case "default":
      return conditions.selector
        ? validateCondition(getFromObject(source, conditions.selector), conditions.condition)
        : true;
    default:
      throw new Error(`Unsupported condition type: ${type}`);
  }
}

/**
 * Validates a value against a condition, supporting MongoDB query operators.
 */
function validateCondition(value: any, condition: Record<string, any>): boolean {
  for (const [operator, operand] of Object.entries(condition)) {
    switch (operator) {
      case "eq": // Equal
        if (value !== operand) return false;
        break;
      case "ne": // Not equal
        if (value === operand) return false;
        break;
      case "gt": // Greater than
        if (value <= operand) return false;
        break;
      case "gte": // Greater than or equal
        if (value < operand) return false;
        break;
      case "lt": // Less than
        if (value >= operand) return false;
        break;
      case "lte": // Less than or equal
        if (value > operand) return false;
        break;
      case "in": // In array
        if (!Array.isArray(operand) || !operand.includes(value)) return false;
        break;
      case "nin": // Not in array
        if (Array.isArray(operand) && operand.includes(value)) return false;
        break;
      case "exists": // Field exists
        if (operand === true && value === undefined) return false;
        if (operand === false && value !== undefined) return false;
        break;
      case "regex": // Regular expression
        if (typeof operand === "string" || operand instanceof RegExp) {
          const regex = operand instanceof RegExp ? operand : new RegExp(operand);
          if (!regex.test(value)) return false;
        } else {
          return false;
        }
        break;
      case "size": // Array size
        if (Array.isArray(value)) {
          if (value.length !== operand) return false;
        } else {
          return false;
        }
        break;
      case "all": // Array contains all elements
        if (Array.isArray(value) && Array.isArray(operand)) {
          if (!operand.every((item) => value.includes(item))) return false;
        } else {
          return false;
        }
        break;
      case "elemMatch": // At least one array element matches condition
        if (Array.isArray(value) && typeof operand === "object") {
          if (!value.some((item) => validateCondition(item, operand))) return false;
        } else {
          return false;
        }
        break;
      case "not": // Not operator
        if (typeof operand === "object" && validateCondition(value, operand)) return false;
        break;
      default:
        // Unsupported operator
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
  return true;
}
