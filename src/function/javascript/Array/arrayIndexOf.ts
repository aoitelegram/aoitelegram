import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arrayIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!ctx.array.has(args[0])) {
      error.errorArray(args[0], "$arrayIndexOf");
    }

    const array = ctx.array.get(args[0]);
    return array.indexOf(args[1]);
  },
};

export { data };
