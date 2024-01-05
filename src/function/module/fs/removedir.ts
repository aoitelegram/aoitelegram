import fsx from "fs-extra";

export default {
  name: "$removedir",
  callback: async (context) => {
    context.argsCheck(1);
    const path = context.inside;
    if (context.isError) return;

    return await fsx.remove(path);
  },
};
