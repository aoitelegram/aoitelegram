export default {
  name: "$findChars",
  callback: (context) => {
    context.argsCheck(1);
    const text = context.inside;
    if (context.isError) return;

    return text.replace(/(\W|\d+)/g, "");
  },
};
