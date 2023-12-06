import os from "node:os";

export default {
  name: "$platform",
  callback: async (ctx, event, database, error) => {
    return os.platform();
  },
};
