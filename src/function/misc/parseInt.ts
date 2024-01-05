export default {
  name: "$parseInt",
  callback: (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    return parseInt(context.inside);
  },
};
