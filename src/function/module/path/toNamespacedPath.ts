import path from "node:path";

export default {
  name: "$toNamespacedPath",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$toNamespacedPath");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return path.toNamespacedPath(args[0]);
  },
};
