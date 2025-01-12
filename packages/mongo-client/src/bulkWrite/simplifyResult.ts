export function simplifyResult(data: any[]) {
  return data
    .map((result: any) => {
      if (!result) return null;
      const deletedIdsArray = result.deletedIds ? result.deletedIds : [];
      const upsertedIdsArray = result.upsertedIds ? result.upsertedIds : [];
      const insertedIdsArray = result.insertedIds ? result.insertedIds : [];
      const transformedItem = {
        ...(result.matchedCount &&
          result.matchedCount > 0 && { matchedCount: result.matchedCount }),
        ...(result.modifiedCount &&
          result.modifiedCount > 0 && { modifiedCount: result.modifiedCount }),
        ...(result.upsertedCount &&
          result.upsertedCount > 0 && { upsertedCount: result.upsertedCount }),
        ...(result.insertedCount &&
          result.insertedCount > 0 && { insertedCount: result.insertedCount }),
        ...(upsertedIdsArray.length > 0 && { upsertedIds: upsertedIdsArray }),
        ...(insertedIdsArray.length > 0 && { insertedIds: insertedIdsArray }),
        ...(deletedIdsArray.length > 0 && { deletedIds: deletedIdsArray }),
        db: result.db!,
        collection: result.collection!,
        stage: result.stage!
      };

      return Object.keys(transformedItem).length > 3 ? transformedItem : null;
    })
    .filter(Boolean);
}
