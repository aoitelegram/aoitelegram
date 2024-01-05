export default {
  name: "$toLowerCase",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return `${context.inside}`.toLowerCase();
  },
};
