import { toParse } from "../parser";

export default {
  name: "$isNumber",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$isNumber");
    const args = await ctx.getEvaluateArgs();

    return toParse(`${args[0]}`) === "number";
  },
};
