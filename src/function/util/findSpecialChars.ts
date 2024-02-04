export default {
  name: "$findSpecialChars",
  callback: async (context) => {
    context.argsCheck(1);
    const text = context.inside;
    if (context.isError) return;

    return text.replace(/(\w+)/g, "");
  },
};
