import { DataFunction } from "context";
import { version } from "../../../../package.json";

const data: DataFunction = {
  name: "$aoiversion",
  callback: async (ctx, event, database, error) => {
    return version;
  },
};

export { data };
