import fsx from "fs-extra";

export default {
  name: "$movedir",
  callback: async (context) => {
    context.argsCheck(2);
    const [path, out] = context.splits;
    if (context.isError) return;

    await fsx.move(path, out);
    return "";
  },
};
