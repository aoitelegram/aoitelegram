import fsx from "fs-extra";

export default {
  name: "$movedir",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$movedir");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "string"]);

    return await fsx.move(args[0], args[1]);
  },
};
