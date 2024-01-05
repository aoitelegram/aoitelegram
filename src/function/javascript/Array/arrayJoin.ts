export default {
  name: "$arrayJoin",
  callback: (context) => {
    context.argsCheck(1);
    const [arrayName, sep = ", "] = context.splits;

    if (context.isError) return;

    if (!context.array.has(arrayName)) {
      context.sendError(
        `The specified variable ${arrayName} does not exist for the array`,
      );
      return;
    }

    const array = context.array.get(arrayName);
    return array.join(sep);
  },
};
