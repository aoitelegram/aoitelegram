import process from "node:process";

export default {
  name: "$uptime",
  callback: async (ctx, event, database, error) => {
    return process.uptime();
  },
};
