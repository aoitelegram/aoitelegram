import { dependencies } from "../../../package.json";

export default {
  name: "$packageDependencies",
  callback: (context) => {
    const [separator = ", "] = context.splits;
    if (context.isError) return;

    return Object.keys(dependencies).join(separator);
  },
};
