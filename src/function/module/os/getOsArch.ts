import os from "node:os";

export default {
  name: "$getOsArch",
  callback: async (ctx, event, database, error) => {
    return os.arch();
  },
};
