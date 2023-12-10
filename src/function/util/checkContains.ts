import { parse } from "../parser";

export default {
  name: "$checkContains",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$checkContains");
    const [text, ...chars] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([text, chars], error, ["unknown", "...unknown"]);
    const result = chars.some((search) => parse(text) === search);
    return result;
  },
};
