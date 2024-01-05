import process from "node:process";

export default {
  name: "$uptime",
  callback: (context) => {
    return process.uptime();
  },
};
