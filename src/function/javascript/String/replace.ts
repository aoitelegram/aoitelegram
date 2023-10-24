import { DataFunction } from "context";

const data: DataFunction = {
  name: "$replace",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(3, true, error, "$replace")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].replace(args[1], args[2]);
  },
};

export { data };
