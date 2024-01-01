export default {
  name: "$deleteVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$deleteVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[2] || database.tables[0];

    if (!database.hasTable(defaultTable)) {
      error.errorTable(defaultTable, "$deleteVar");
      return;
    }
    return database.delete(defaultTable, args[0], args[1]);
  },
};
