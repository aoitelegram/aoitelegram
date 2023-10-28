import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arraLastIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arraLastIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    if (!event.telegram?.array.has(args[0])) {
      error.errorArray(args[0], "$arraLastIndexOf");
    }
    const array = event.telegram.array.get(args[0]);
    return array.lastIndexOf(args[1]);
  },
};

export { data };
