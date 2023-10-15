import { Context } from "context";

export const data = {
  name: "$print",
  callback: async (ctx: Context, event: any) => {
    if (!ctx.argsCheck(1, true, event)) return;
    console.log(...(await ctx.evaluateArgs(ctx.getArgs())));
    return "";
  },
};
