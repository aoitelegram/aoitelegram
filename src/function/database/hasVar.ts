export default {
  name: "$hasVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$hasVar");
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[1] || database.table[0];

    if (!(await database.hasTable(defaultTable))) {
      error.errorTable(defaultTable, "$hasVar");
      return;
    }
    return await database.has(defaultTable, args[0]);
  },
};
