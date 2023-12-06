import fs from "node:fs/promises";

export default {
  name: "$stat",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.stat(args[0]);
  },
};
