import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arraySlice",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arraySlice")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arraySlice");
    }

    const array = ctx.array.get(args[0]);
    return array.slice(args[1] >= 1 ? args[1] - 1 : args[1] + 1);
  },
};

export { data };
