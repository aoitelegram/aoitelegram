import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$join",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$join")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    args[0] = toArray(args[0]);

    if (!Array.isArray(args[0])) {
      error.errorType("array", "$join");
      return;
    }

    return args[0].join(args[1]);
  },
};

export { data };
