export default {
  name: "$checkContains",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const [text, ...chars] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([text, chars], error, ["string", "...unknown"]);
    const result = chars.some((search) => text === search);
    return result;
  },
};
