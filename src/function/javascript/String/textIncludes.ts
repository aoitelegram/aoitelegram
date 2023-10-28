import { DataFunction } from "context";

const data: DataFunction = {
  name: "$textIncludes",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$textIncludes")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    return args[0].includes(args[1]);
  },
};

export { data };
