import fsx from "fs-extra";

export default {
  name: "$copyfs",
  callback: async (context) => {
    context.argsCheck(2);
    const [path, outPath] = context.splits;
    if (context.isError) return;

    await fsx.copy(path, outPath);
    return "";
  },
};
