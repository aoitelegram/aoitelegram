import { toParse } from "../parser";

export default {
  name: "$isUndefined",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$isUndefined");
    const args = await ctx.getEvaluateArgs();

    return toParse(`${args[0]}`) === "undefined";
  },
};
