import fs from "node:fs/promises";

export default {
  name: "$readdir",
  callback: async (context) => {
    context.argsCheck(1);
    const path = context.inside;
    if (context.isError) return;

    await fs.readdir(path);
    return "";
  },
};
