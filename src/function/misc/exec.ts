import { execSync } from "node:child_process";

export default {
  name: "$exec",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$exec");
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, ["string"]);

    try {
      return execSync(args[0]).toString();
    } catch (err) {
      return err;
    }
  },
};
