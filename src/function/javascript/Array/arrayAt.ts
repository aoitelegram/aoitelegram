export default {
  name: "$arrayAt",
  callback: (context) => {
    context.argsCheck(1);
    const [arrayName, index = 1] = context.splits;
    context.checkArgumentTypes(["unknown", "number | undefined"]);

    if (context.isError) return;

    if (!context.array.has(arrayName)) {
      context.sendError(
        `The specified variable ${arrayName} does not exist for the array`,
      );
      return;
    }

    const array = context.array.get(arrayName);
    return array[index - 1 >= 1 ? index - 1 : index - 1];
  },
};
