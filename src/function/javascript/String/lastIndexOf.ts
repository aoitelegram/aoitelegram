import { DataFunction } from "context";

const data: DataFunction = {
  name: "$lastIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$lastIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].lastIndexOf(args[1] - 1);
  },
};

export { data };
