import { DataFunction } from "context";

const data: DataFunction = {
  name: "$client",
  callback: async (ctx, event, database, error) => {
    const args = await ctx.evaluateArgs(ctx.getArgs());
    const getMe = (await event.telegram?.getMe()) ?? event;
    return getMe[args[0]];
  },
};

export { data };
