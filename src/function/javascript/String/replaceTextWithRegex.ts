export default {
  name: "$replaceTextWithRegex",
  callback: (context) => {
    context.argsCheck(3);
    const [text, toReplace, regex, flags] = context.splits;
    if (context.isError) return;

    const regexFlags = new RegExp(regex, flags);
    return text.replace(regexFlags, toReplace);
  },
};
