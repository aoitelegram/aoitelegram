import { DataFunction } from "context";

const data: DataFunction = {
  name: "$repeat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$repeat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].repeat(args[1] - 1);
  },
};

export { data };
