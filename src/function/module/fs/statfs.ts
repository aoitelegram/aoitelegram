import fs from "node:fs/promises";

export default {
  name: "$statfs",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$statfs");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.readFile(args[0]);
  },
};
