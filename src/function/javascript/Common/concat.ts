import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$concat",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$concat")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const text = args.shift();
    return toArray(text).concat(...args);
  },
};

export { data };
