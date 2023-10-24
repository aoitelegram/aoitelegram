import { DataFunction } from "context";

const data: DataFunction = {
  name: "$toUpperCase",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(1, true, error, "$toUpperCase")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0].toUpperCase();
  },
};

export { data };
