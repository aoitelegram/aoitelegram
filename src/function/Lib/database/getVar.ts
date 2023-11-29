export default {
  name: "$getVar",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$getVar");
    const args = await ctx.getEvaluateArgs();
    args[1] === undefined ? (args[1] = "main") : null;

    if (!(await database.hasTable(args[1]))) {
      error.errorTable(args[1], "$getVar");
      return;
    }

    return await database.get(args[1], args[0]);
  },
};
