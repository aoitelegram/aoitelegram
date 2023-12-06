import { toParse } from "../parser";

export default {
  name: "$isNaN",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();

    return toParse(`${args[0]}`) === "nan";
  },
};
