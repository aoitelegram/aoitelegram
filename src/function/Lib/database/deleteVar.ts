export default {
  name: "$deleteVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    const defaultTable = args[2] || database.table[0];

    if (!(await database.hasTable(defaultTable))) {
      error.errorTable(defaultTable, "$deleteVar");
      return;
    }
    return await database.delete(defaultTable, args[0], args[1]);
  },
};
