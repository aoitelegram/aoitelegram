import { DataFunction } from "context";

const data: DataFunction = {
  name: "$usernameID",
  callback: async (ctx, event, database, error) => {
    const usernameID = event.from.id ?? event.message?.from.id;
    return usernameID || null;
  },
};

export { data };
