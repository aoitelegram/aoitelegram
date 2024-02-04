export default {
  name: "$abs",
  callback: (context) => {
    context.argsCheck(1);
    const number = context.inside;
    context.checkArgumentTypes(["number"]);
    if (context.isError) return;

    return Math.abs(number);
  },
};
