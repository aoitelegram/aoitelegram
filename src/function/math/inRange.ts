export default {
  name: "$inRange",
  callback: (context) => {
    context.argsCheck(1);
    const [number, min = 0, max = 100] = context.splits;
    context.checkArgumentTypes(["number"]);
    if (context.isError) return;

    const parseNumber = Number(number);
    return Math.max(min, number) === Math.min(max, number);
  },
};
