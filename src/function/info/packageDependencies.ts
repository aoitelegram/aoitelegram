export default {
  name: "$packageDependencies",
  callback: (context) => {
    const [separator = ", "] = context.splits;
    if (context.isError) return;

    return Object.keys(context.packageJSON.dependencies).join(separator);
  },
};
