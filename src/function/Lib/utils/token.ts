import { DataFunction } from "context";

const data: DataFunction = {
  name: "$token",
  callback: async (ctx, event, database, error) => {
    return event.telegram?.token ?? null;
  },
};

export { data };
