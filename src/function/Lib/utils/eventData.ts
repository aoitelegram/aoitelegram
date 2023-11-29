import { getObjectKey } from "../../JavaScript/Object/getObjectProperty";

export default {
  name: "$eventData",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    return args[0] ? getObjectKey(event, args[0]) : event;
  },
};
