import process from "node:process";

export default {
  name: "$exitProcess",
  callback: (context) => {
    return process.exit();
  },
};
