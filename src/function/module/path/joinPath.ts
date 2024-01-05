import path from "node:path";

export default {
  name: "$joinPath",
  callback: (context) => {
    context.argsCheck(2);
    const args = context.splits;
    if (context.isError) return;

    return path.join(...args);
  },
};
