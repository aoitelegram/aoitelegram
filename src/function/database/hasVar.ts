export default {
  name: "$hasVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[1] || database.tables[0];

    if (!database.hasTable(defaultTable)) {
      error.errorTable(defaultTable, "$hasVar");
      return;
    }
    return database.has(defaultTable, args[0]);
  },
};
