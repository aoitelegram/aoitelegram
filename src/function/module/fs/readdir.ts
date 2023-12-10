import fs from "node:fs/promises";

export default {
  name: "$readdir",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$readdir");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.readdir(args[0]);
  },
};
