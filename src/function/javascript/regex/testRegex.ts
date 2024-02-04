export default {
  name: "$testRegex",
  callback: (context) => {
    context.argsCheck(2);
    const [text, regex, flags] = context.splits;
    if (context.isError) return;

    return new RegExp(regex, flags).test(text);
  },
};
