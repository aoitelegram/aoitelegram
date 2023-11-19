export default {
  name: "$deleteVar",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$deleteVar")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    args[2] === undefined ? (args[2] = "main") : null;

    if (!(await database.hasTable(args[2]))) {
      error.errorTable(args[2], "$deleteVar");
      return;
    }
    return await database.delete(args[2], args[0], args[1]);
  },
};
