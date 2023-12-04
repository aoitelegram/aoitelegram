import { getObjectKey } from "../parser";

export default {
  name: "$eventData",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.getEvaluateArgs();
    return args[0] ? getObjectKey(event, args[0]) : event;
  },
};
