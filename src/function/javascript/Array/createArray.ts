import { DataFunction } from "context";

const data: DataFunction = {
  name: "$createArray",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$createArray")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const args1 = args[0];
    const args2 = args.shift();
    return event.telegram?.array.set(args1, [...args]).size;
  },
};

export { data };
