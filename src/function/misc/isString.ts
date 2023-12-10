import { toParse } from "../parser";

export default {
  name: "$isString",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$isString");
    const args = await ctx.getEvaluateArgs();

    return toParse(`${args[0]}`) === "string";
  },
};
