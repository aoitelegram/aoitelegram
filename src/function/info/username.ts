import { DataFunction } from "context";

const data: DataFunction = {
  name: "$username",
  callback: async (ctx, event, database, error) => {
    const username = event.from.username ?? event.message?.from.username;
    return username || null;
  },
};

export { data };
