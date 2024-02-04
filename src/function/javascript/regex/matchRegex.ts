export default {
  name: "$matchRegex",
  callback: (context) => {
    context.argsCheck(2);
    const [text, regex, flags] = context.splits;
    if (context.isError) return;

    const regexFlags = new RegExp(regex, flags);
    return text.match(regexFlags)?.[0];
  },
};
