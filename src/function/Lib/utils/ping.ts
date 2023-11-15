import { DataFunction } from "context";

const data: DataFunction = {
  name: "$ping",
  callback: async (ctx, event) => {
    return await event.telegram?.ping();
  },
};

export { data };
