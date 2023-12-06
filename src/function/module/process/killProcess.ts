import process from "node:process";

export default {
  name: "$killProcess",
  callback: async (ctx, event, database, error) => {
    return process.kill(0);
  },
};
