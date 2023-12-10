import fsx from "fs-extra";

export default {
  name: "$removedir",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$removedir");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fsx.remove(args[0]);
  },
};
