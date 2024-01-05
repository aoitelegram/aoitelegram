export default {
  name: "$textTrim",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return `${context.inside}`.trim();
  },
};
