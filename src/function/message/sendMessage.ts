import { Context } from "context";

export const data = {
  name: "$sendMessage",
  callback: async (ctx: Context, event: any) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.send(args[0]);
    return "";
  },
};
