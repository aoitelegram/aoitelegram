export default {
  name: "$createArray",
  callback: (context) => {
    context.argsCheck(2);
    const [arrayName, ...array] = context.splits;
    if (context.isError) return;

    return context.array.set(arrayName, [...array]).size;
  },
};
