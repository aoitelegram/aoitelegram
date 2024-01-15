import ms from "ms";

function hasObject(arg: any): arg is object {
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
    const [name, milliseconds, data = {}] = context.splits;
    context.checkArgumentTypes(["string", "string", "object"]);
    if (context.isError) return;

    if (!hasObject(data)) {
      context.sendError("Invalid Object");
      return;
    }

    await context.telegram.timeoutManager.addTimeout(name, {
      milliseconds: +ms(milliseconds),
      data: JSON.parse(JSON.stringify(data)),
    });
  },
};
