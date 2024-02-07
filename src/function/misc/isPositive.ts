export default {
  name: "$isPositive",
  callback: (context) => {
    context.argsCheck(1);
    const number = context.inside;
    if (context.isError) return;

    const isNumber = !Number(number);
    return isNumber ? false : number > 0;
  },
};
