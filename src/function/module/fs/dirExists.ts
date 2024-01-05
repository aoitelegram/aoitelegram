import fs from "node:fs/promises";

export default {
  name: "$dirExists",
  callback: async (context) => {
    context.argsCheck(1);
    const path = context.inside;
    if (context.isError) return;

    try {
      await fs.access(path);
      return true;
    } catch (err) {
      return false;
    }
  },
};
