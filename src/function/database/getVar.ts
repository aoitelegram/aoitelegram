export default {
  name: "$getVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[1] || database.tables[0];

    if (!database.hasTable(defaultTable)) {
      error.errorTable(defaultTable, "$getVar");
      return;
    }

    return database.get(defaultTable, args[0]);
  },
};
