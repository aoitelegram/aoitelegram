import path from "node:path";

export default {
  name: "$normalizePath",
  callback: (context) => {
    context.argsCheck(1);
    const paths = context.inside;
    if (context.isError) return;

    return path.normalize(paths);
  },
};
