import { DataFunction } from "context";

const data: DataFunction = {
  name: "$indexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$indexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].indexOf(args[1] - 1);
  },
};

export { data };
