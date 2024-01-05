export default {
  name: "$arrayConcat",
  callback: (context) => {
    context.argsCheck(2);
    const [arrayName, arrayConcat, sep = ","] = context.splits;
    if (context.isError) return;

    if (!context.array.has(arrayName)) {
      context.sendError(
        `The specified variable ${arrayName} does not exist for the array`,
      );
      return;
    }

    const array = context.array.get(arrayName);
    return array.concat(...arrayConcat.split(","));
  },
};
