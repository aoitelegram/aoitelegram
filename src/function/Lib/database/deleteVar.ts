export default {
  name: "$deleteVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    args[2] === undefined ? (args[2] = "main") : null;

    if (!(await database.hasTable(args[2]))) {
      error.errorTable(args[2], "$deleteVar");
      return;
    }
    return await database.delete(args[2], args[0], args[1]);
  },
};
