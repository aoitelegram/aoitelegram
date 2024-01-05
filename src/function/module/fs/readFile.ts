import fs from "node:fs/promises";

export default {
  name: "$readFile",
  callback: async (context) => {
    context.argsCheck(1);
    const path = context.inside;
    if (context.isError) return;

    return await fs.readFile(path, "utf-8");
  },
};
