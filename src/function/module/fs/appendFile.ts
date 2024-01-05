import fs from "node:fs/promises";

export default {
  name: "$appendFile",
  callback: async (context) => {
    context.argsCheck(2);
    const [path, content] = context.splits;
    if (context.isError) return;

    await fs.appendFile(path, content, "utf-8");
    return "";
  },
};
