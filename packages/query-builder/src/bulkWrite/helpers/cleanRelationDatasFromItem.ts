export function cleanRelationDatasFromItem(item: any, relationFieldKeys: string[]) {
  relationFieldKeys.forEach((key) => {
    if (item[key] && Array.isArray(item[key])) {
      item[key] = item[key].map((i: any) => (i ? i._id : undefined));
    } else if (item[key] && typeof item[key] === "object") {
      item[key] = item[key]._id;
    }
  });
  return item;
}
