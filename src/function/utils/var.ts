import { DataFunction } from "context";

const data: DataFunction = {
  name: "$var",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$var")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    return await database.set("vars", args[0], args[1]);
  },
};

export { data };
