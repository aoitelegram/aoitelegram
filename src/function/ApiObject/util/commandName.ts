import { DataFunction } from "context";

const data: DataFunction = {
  name: "$commandName",
  callback: async (ctx, event, database, error) => {
    return ctx.fileName?.event ? null : ctx.fileName;
  },
};

export { data };
