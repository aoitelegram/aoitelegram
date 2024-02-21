import ms from "ms";

function hasObject(arg: any) {
  try {
    return !!JSON.parse(JSON.stringify(arg));
  } catch (err) {
    return false;
  }
}

export default {
  name: "$setTimeout",
  callback: async (context) => {
    context.argsCheck(2);
    const [name, milliseconds, data = "{}"] = context.splits;
    context.checkArgumentTypes(["string", "string", "object"]);
    if (context.isError) return;

    if (!hasObject(data)) {
      context.sendError("Invalid Object");
      return;
    }

    if (+ms(milliseconds) <= 5000) {
      context.sendError(
        `The specified time should be greater than 5000 milliseconds. Timeout ID: ${context.id}`,
      );
      return;
    }

    return await context.telegram.timeoutManager.addTimeout(name, {
      milliseconds: +ms(milliseconds),
      data: JSON.parse(data),
    });
  },
};
