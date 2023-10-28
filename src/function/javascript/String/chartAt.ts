import { DataFunction } from "context";

const data: DataFunction = {
  name: "$chartAt",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$chartAt")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].charAt(args[1] - 1);
  },
};

export { data };
