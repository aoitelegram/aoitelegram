import fs from "node:fs/promises";

export default {
  name: "$copyFile",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string", "string"]);

    return await fs.copyFile(args[0], args[1]);
  },
};
