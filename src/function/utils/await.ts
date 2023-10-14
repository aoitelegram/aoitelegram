export const data = {
  name: "$await",
  callback: async (ctx: any) => {
    const [time = 1] = await ctx.evaluateArgs(ctx.getArgs(0, 1));
    return new Promise((res) => setTimeout(() => res(""), time * 1000));
  },
};
