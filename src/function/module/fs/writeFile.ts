import fs from "node:fs/promises";

export default {
  name: "$writeFile",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    return await fs.writeFile(args[0], args[1], "utf-8");
  },
};
