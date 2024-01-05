export default {
  name: "$replaceAll",
  callback: (context) => {
    context.argsCheck(3);
    const [text, search, toReplace] = context.splits;
    if (context.isError) return;

    const regex = new RegExp(search, "g");
    return `${text}`.replace(regex, toReplace);
  },
};
