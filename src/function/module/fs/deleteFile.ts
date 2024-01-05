import fs from "node:fs/promises";

export default {
  name: "$deleteFile",
  callback: async (context) => {
    context.argsCheck(1);
    const path = context.inside;

    await fs.unlink(path);
    return "";
  },
};
