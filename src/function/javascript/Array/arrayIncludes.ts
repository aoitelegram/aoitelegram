import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arrayIncludes",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayIncludes")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayIncludes");
    }

    const array = ctx.array.get(args[0]);
    return array.includes(args[1]);
  },
};

export { data };