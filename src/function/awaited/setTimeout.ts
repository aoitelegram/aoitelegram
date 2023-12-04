import ms from "ms";

function hasObject(arg: any): arg is object {
  try {
    return !!JSON.parse(arg);
  } catch (err) {
    return false;
  }
}

export default {
  name: "$setTimeout",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(2, error);
    const args = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes(args, error, [
      "string",
      "string",
      "object | undefined",
    ]);
    await event.telegram?.timeoutManager.addTimeout(args[0], {
      milliseconds: +ms(args[1]),
      data: args[2],
    });
  },
};
