export default {
  name: "$trunc",
  callback: (context) => {
    context.argsCheck(1);
    const trunc = context.inside;
    context.checkArgumentTypes(["number"]);
    if (context.isError) return;

    return Math.trunc(trunc);
  },
};
