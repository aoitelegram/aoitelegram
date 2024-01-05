export default {
  name: "$divide",
  callback: (context) => {
    context.argsCheck(2);
    const [divide1, divide2] = context.splits;
    context.checkArgumentTypes(["number", "number"]);
    if (context.isError) return;

    return divide1 / divide2;
  },
};
