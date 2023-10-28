import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arrayAt",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayAt")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    if (!event.telegram?.array.has(args[0])) {
      error.errorArray(args[0], "$arrayAt");
    }
    const array = event.telegram.array.get(args[0]);
    return array.at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};

export { data };
