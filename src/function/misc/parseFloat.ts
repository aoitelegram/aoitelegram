export default {
  name: "$parseFloat",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return parseFloat(context.inside);
  },
};
