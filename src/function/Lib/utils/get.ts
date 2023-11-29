export default {
  name: "$get",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$get");
    const args = await ctx.evaluateArgs(ctx.getArgs(0, 2));
    const reponse =
      args[1] === "global"
        ? event.telegram?.globalVars.get(args[0])
        : ctx.localVars.get(args[0]);

    return reponse;
  },
};
