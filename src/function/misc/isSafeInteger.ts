export default {
  name: "$isSafeInteger",
  callback: (context) => {
    context.argsCheck(1);
    const number = context.inside;
    if (context.isError) return;

    return Number.isSafeInteger(+number);
  },
};
