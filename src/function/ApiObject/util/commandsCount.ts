import { DataFunction } from "context";

const data: DataFunction = {
  name: "$commandsCount",
  callback: async (ctx, event, database, error) => {
    return event.telegram?.commands.length;
  },
};

export { data };
