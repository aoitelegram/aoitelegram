import ms from "ms";

function hasObject(arg: any): arg is object {
  try {
    return !!JSON.parse(arg);
  } catch (err) {
    return false;
  }
}

export default {
  name: "$loop",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error, "$loop");
    const [name, milliseconds, data = {}] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([name, milliseconds, data], error, [
      "string",
      "string",
      "object",
    ]);

    if (!hasObject(data)) {
      error.customError("Error object", "$setTimeout");
    }

    await event.telegram?.awaitedManager.addAwaited(name, {
      milliseconds: +ms(milliseconds),
      data: data,
      context: event,
    });
  },
};
