import path from "node:path";

export default {
  name: "$joinPath",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$joinPath");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["...string"]);

    return path.join(...args);
  },
};
