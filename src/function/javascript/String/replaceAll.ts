export default {
  name: "$replaceAll",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error, "$replaceAll");
    const args = await ctx.getEvaluateArgs();
    const regex = new RegExp(args[1], "g");
    return `${args[0]}`.replace(regex, args[2]);
  },
};
