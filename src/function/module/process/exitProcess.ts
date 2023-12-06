import process from "node:process";

export default {
  name: "$exitProcess",
  callback: async (ctx, event, database, error) => {
    return process.exit();
  },
};
