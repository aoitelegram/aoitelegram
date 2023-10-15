import { Context } from "context";

export const data = {
  name: "$sendMessage",
  callback: async (ctx: Context, event: any) => {
    if (!ctx.argsCheck(1, true, event)) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.send(args[0]);
    return "";
  },
};
