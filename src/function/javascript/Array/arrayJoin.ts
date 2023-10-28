import { DataFunction } from "context";

const data: DataFunction = {
  name: "$arrayJoin",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$arrayJoin")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    if (!event.telegram?.array.has(args[0])) {
      error.errorArray(args[0], "$arrayJoin");
    }
    const array = event.telegram.array.get(args[0]);
    return array.join(args[1]);
  },
};

export { data };
