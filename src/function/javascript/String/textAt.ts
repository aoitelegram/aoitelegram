import { DataFunction } from "context";

const data: DataFunction = {
  name: "$textAt",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textAt")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};

export { data };
