import fs from "node:fs/promises";

export default {
  name: "$deleteFile",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$deleteFile");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.unlink(args[0]);
  },
};
