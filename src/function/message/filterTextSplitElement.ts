export default {
  name: "$filterTextSplitElement",
  callback: (context) => {
    context.argsCheck(1);
    const [query, type = "equal", separator = ","] = context.splits;
    if (context.isError) return;

    const arraySplit = context.array.get("splitText") || [];

    switch (type) {
      case "equal":
        return arraySplit.filter((x) => x === query);
      case "starts":
        return arraySplit.filter((x) => x.startsWith(query));
      case "ends":
        return arraySplit.filter((x) => x.endsWith(query));
      case "includes":
        return arraySplit.filter((x) => x.includes(query));
      default:
        return context.sendError(`Invalid Type`);
    }
  },
};
