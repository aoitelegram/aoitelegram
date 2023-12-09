import process from "node:process";

export default {
  name: "$nodeVersion",
  callback: async (ctx, event, database, error) => {
    return process.version;
  },
};
