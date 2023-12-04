// @ts-ignore
import { version } from "../../../package.json";

export default {
  name: "$aoiversion",
  callback: async (ctx, event, database, error) => {
    return version;
  },
};
