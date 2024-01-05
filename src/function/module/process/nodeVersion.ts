import process from "node:process";

export default {
  name: "$nodeVersion",
  callback: (context) => {
    return process.version;
  },
};
