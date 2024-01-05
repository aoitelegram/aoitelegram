import fs from "node:fs/promises";

export default {
  name: "$writeFile",
  callback: async (context) => {
    context.argsCheck(2);
    const [path, content] = context.splits;
    if (context.isError) return;

    return await fs.writeFile(path, context, "utf-8");
  },
};
