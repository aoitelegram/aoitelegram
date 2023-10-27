import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$includes",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$includes")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());

    return toArray(args[0]).includes(args[1]);
  },
};

export { data };
