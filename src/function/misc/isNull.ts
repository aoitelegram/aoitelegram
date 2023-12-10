import { toParse } from "../parser";

export default {
  name: "$isNull",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$isNull");
    const args = await ctx.getEvaluateArgs();

    return toParse(`${args[0]}`) === "null";
  },
};
