import path from "node:path";

export default {
  name: "$parsePath",
  callback: (context) => {
    context.argsCheck(1);
    const paths = context.inside;
    if (context.isError) return;

    return path.parse(paths);
  },
};
