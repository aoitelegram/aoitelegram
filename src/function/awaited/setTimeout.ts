import ms from "ms";

export default {
  name: "$setTimeout",
  callback: async (context) => {
    context.argsCheck(2);
    const [name, milliseconds, data = "{}"] = context.splits;
    context.checkArgumentTypes(["string", "string", "object"]);
    if (context.isError) return;

    if (!isNaN(+ms(milliseconds)) && +ms(milliseconds) <= 5000) {
      context.sendError(
        `The specified time should be greater than 5000 milliseconds. Timeout ID: ${name}`,
      );
      return;
    }

    return await context.telegram.timeoutManager.addTimeout(name, {
      milliseconds: +ms(milliseconds),
      data: JSON.parse(data),
    });
  },
};
