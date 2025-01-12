import { processCondition } from "./processCondition";

/**
 * Validates rules against the given context and returns an array of errors.
 */
export function checkRules(rules: any[], context: any): string[] {
  const errors: string[] = [];
  const operators = ["or", "and", "not", "nor", "selector"];
  rules.forEach((rule) => {
    const source = context[rule.source];
    if (!source) {
      errors.push("Source not found");
      return;
    }
    rule.expect.forEach((expect: any) => {
      operators.forEach((key) => {
        const type = key === "selector" ? "default" : key;
        const conditions = expect[key];
        if (conditions && !processCondition(type, expect, source)) {
          errors.push(rule.message);
        }
      });
    });
  });
  return errors;
}
