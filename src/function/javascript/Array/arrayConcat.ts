import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arrayConcat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayConcat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!event.telegram?.array.has(args[0])) {
      error.errorArray(args[0], "$arrayConcat");
    }
    const array = event.telegram.array.get(args[0]);
    const text = args.shift();
    return array.concat(...args);
  },
};

export { data };
