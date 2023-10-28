import { DataFunction } from "context";

const data: DataFunction = {
  name: "$sendMessage",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$sendMessage")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    event.send(args[0]);
    return "";
  },
};

export { data };
