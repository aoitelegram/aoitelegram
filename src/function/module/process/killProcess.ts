import process from "node:process";

export default {
  name: "$killProcess",
  callback: (context) => {
    return process.kill(0);
  },
};
