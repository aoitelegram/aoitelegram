import { DataFunction } from "context";
import { toArray } from "../../utils";

const data: DataFunction = {
  name: "$at",
  callback: async (ctx, event, database, error) => {
    if (!ctx.argsCheck(2, true, error, "$at")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return toArray(args[0]).at(args[1] >= 1 ? args[1] - 1 : args[1]);
  },
};

export { data };
