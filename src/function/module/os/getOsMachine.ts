import os from "node:os";

export default {
  name: "$getOsMachine",
  callback: async (ctx, event, database, error) => {
    return os.machine();
  },
};
