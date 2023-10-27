import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$indexOf",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$indexOf")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return toArray(args[0]).indexOf(args[1]);
  },
};

export { data };
