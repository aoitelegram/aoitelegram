import process from "node:process";

export default {
  name: "$ram",
  callback: (context) => {
    const [type = "rss"] = context.splits;
    return process.memoryUsage()[type] / 1024 / 1024;
  },
};
