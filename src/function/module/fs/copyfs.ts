import fsx from "fs-extra";

export default {
  name: "$copyfs",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$copyfs");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "string"]);

    return await fsx.copy(args[0], args[1]);
  },
};
