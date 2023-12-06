import process from "node:process";

export default {
  name: "$ram",
  callback: async (ctx, event, database, error) => {
    const [type = "rss"] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([type], error, ["string"]);
    return process.memoryUsage()[type] / 1024 / 1024;
  },
};
