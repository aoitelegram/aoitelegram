import { DataFunction } from "context";

const data: DataFunction = {
  name: "$commandName",
  callback: async (ctx, event, database, error) => {
    return ctx.fileName && ctx.type === "command" ? ctx.fileName : undefined;
  },
};

export { data };
