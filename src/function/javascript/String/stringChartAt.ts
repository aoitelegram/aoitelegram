import { DataFunction } from "context";

const data: DataFunction = {
  name: "$stringChartAt",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$stringChartAt")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].charAt(args[1] - 1);
  },
};

export { data };
