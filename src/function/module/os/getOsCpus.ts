import os from "node:os";

export default {
  name: "$getOSTCpus",
  callback: async (ctx, event, database, error) => {
    return os.cpus();
  },
};
