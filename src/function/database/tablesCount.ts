export default {
  name: "$tablesCount",
  callback: (context) => {
    if (context.isError) return;

    return context.database.tables.length;
  },
};
