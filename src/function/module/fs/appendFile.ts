import fs from "node:fs/promises";

export default {
  name: "$appendFile",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$appendFile");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.appendFile(args[0], args[1], "utf-8");
  },
};
