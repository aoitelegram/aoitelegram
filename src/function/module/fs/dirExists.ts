import fs from "node:fs/promises";

export default {
  name: "$dirExists",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    try {
      await fs.access(args[0]);
      return true;
    } catch (err) {
      return false;
    }
  },
};
