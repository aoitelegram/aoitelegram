import process from "node:process";

export default {
  name: "$currentWorkingDirectory",
  callback: async (ctx, event, database, error) => {
    return process.cwd();
  },
};
