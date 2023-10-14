export const data = {
  name: "$print",
  callback: async (ctx: any, tg: any) => {
    console.log(...(await ctx.evaluateArgs(ctx.getArgs())));
    return "";
  },
};
