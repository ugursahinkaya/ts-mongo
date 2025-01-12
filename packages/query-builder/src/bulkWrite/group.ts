export function group(data: Record<string, any>[]) {
  const payload: Record<string, Record<string, any[]>> = {};
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const { collection, db } = item[key];
      delete item[key].collection;
      delete item[key].db;
      if (!payload[db]) {
        payload[db] = {};
      }
      if (!payload[db]![collection]) {
        payload[db]![collection] = [];
      }
      payload[db]![collection]!.push({ [key]: item[key] });
    });
  });
  return payload;
}
