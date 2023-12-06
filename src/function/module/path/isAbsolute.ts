import path from "node:path";

export default {
  name: "$isAbsolute",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return path.isAbsolute(args[0]);
  },
};
