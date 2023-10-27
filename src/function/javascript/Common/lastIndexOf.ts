import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$lastIndexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$lastIndexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return toArray(args[0]).lastIndexOf(args[1]);
  },
};

export { data };
