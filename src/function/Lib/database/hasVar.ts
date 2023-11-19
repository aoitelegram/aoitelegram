export default {
  name: "$hasVar",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$hasVar")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    args[1] === undefined ? (args[1] = "main") : null;

    if (!(await database.hasTable(args[1]))) {
      error.errorTable(args[1], "$hasVar");
      return;
    }
    return await database.has(args[1], args[0]);
  },
};
