import process from "node:process";

export default {
  name: "$currentWorkingDirectory",
  callback: (context) => {
    return process.cwd();
  },
};
