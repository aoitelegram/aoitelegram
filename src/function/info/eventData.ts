import { getObjectKey } from "../parser";

export default {
  name: "$eventData",
  callback: async (ctx, event, database, error) => {
    const [path] = await ctx.getEvaluateArgs();
    return path ? getObjectKey(event, path) : event;
  },
};
