export default {
  name: "$hasVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    args[1] === undefined ? (args[1] = "main") : null;

    if (!(await database.hasTable(args[1]))) {
      error.errorTable(args[1], "$hasVar");
      return;
    }
    return await database.has(args[1], args[0]);
  },
};
