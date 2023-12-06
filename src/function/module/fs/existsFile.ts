import fs from "node:fs";

export default {
  name: "$existsFile",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);
    try {
      fs.existsSync(args[0]);
      return true;
    } catch (err) {
      return false;
    }
  },
};
