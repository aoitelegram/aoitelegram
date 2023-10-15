import { Context } from "context";

export const data = {
  name: "$replyMessage",
  callback: async (ctx: Context, event: any) => {
    if (!ctx.argsCheck(1, true, event)) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.reply(args[0]);
    return "";
  },
};
