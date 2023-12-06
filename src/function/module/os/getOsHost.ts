import os from "node:os";

export default {
  name: "$getOsHost.ts",
  callback: async (ctx, event, database, error) => {
    return os.hostname();
  },
};
