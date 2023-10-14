export const data = {
  name: "$ping",
  callback: async (ctx: any, event: any) => {
    return await event.telegram.ping();
  },
};
