import { Context } from "context";

export const data = {
  name: "$print",
  callback: async (ctx: Context) => {
    console.log(...(await ctx.evaluateArgs(ctx.getArgs())));
    return "";
  },
};
