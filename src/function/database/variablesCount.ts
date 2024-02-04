export default {
  name: "$variablesCount",
  callback: (context) => {
    const tables = context.inside;
    if (context.isError) return;

    return tables
      ? context.database.collection.filter((v, k) => k.split("_")[1] == tables)
          .size
      : context.database.collection.size;
  },
};
