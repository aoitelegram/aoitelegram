import { version } from "../../../package.json";

export default {
  name: "$packageVersion",
  callback: async (ctx, event, database, error) => {
    return version;
  },
};
