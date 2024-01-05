import fs from "node:fs/promises";

export default {
  name: "$copyFile",
  callback: async (context) => {
    context.argsCheck(2);
    const [path, outPath] = context.splits;
    if (context.isError) return;

    await fs.copyFile(path, outPath);
    return "";
  },
};
