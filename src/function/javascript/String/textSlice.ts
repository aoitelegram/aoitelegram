import { DataFunction } from "context";

const data: DataFunction = {
  name: "$textSlice",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textSlice")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].slice(args[1] >= 1 ? args[1] - 1 : args[1] + 1);
  },
};

export { data };
