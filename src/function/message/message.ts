export const data = {
  name: "$message",
  callback: async (ctx: any, event: any) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const argsFunc = event.text?.split(/\s+/).slice(1)?.[Number(args[0]) - 1];
    const noArgsFunc = event.text?.split(/\s+/).slice(1).join(" ");
    return args[0] === undefined ? noArgsFunc : argsFunc;
  },
};
