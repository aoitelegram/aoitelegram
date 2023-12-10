import path from "node:path";

export default {
  name: "$resolvePath",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$resolvePath");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return path.resolve(args[0]);
  },
};
