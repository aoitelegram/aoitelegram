import { DataFunction } from "context";

const data: DataFunction = {
  name: "$ping",
  callback: async (ctx, event) => {
    return (await event.telegram?.ping()) ?? 0;
  },
};

export { data };
