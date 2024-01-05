import fs from "node:fs";

export default {
  name: "$fileExists",
  callback: (context) => {
    context.argsCheck(1);
    const path = context.inside;
    if (context.isError) return;

    try {
      fs.existsSync(path);
      return true;
    } catch (err) {
      return false;
    }
  },
};
