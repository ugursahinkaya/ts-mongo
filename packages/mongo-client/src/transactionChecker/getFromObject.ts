/**
 * Extracts a value from an object using a selector path.
 */
export function getFromObject(obj: any, source: any[]): any {
  if (!source) {
    return;
  }
  const activeKey = source.shift();
  if (obj[activeKey]) {
    return source.length === 0 ? obj[activeKey] : getFromObject(obj[activeKey], source);
  }
  return undefined;
}
