export default {
  name: "$isInteger",
  callback: (context) => {
    context.argsCheck(1);
    const number = context.inside;
    if (context.isError) return;

    return Number.isInteger(+number);
  },
};
