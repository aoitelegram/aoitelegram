import path from "node:path";

export default {
  name: "$isAbsolute",
  callback: (context) => {
    context.argsCheck(1);
    const paths = context.inside;
    if (context.isError) return;

    return path.isAbsolute(paths);
  },
};
