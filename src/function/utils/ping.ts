import { Context } from "context";

export const data = {
  name: "$ping",
  callback: async (ctx: Context, event: any) => {
    return (await event.telegram?.ping()) ?? 0;
  },
};
