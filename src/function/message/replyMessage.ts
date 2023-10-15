import { DataFunction } from "context";

const data: DataFunction = {
  name: "$replyMessage",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$replyMessage")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    await event.reply(args[0]);
    return "";
  },
};

export { data };
