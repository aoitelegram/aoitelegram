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
    if (!ctx.argsCheck(2, true, error, "$setTimeout")) return;
    const args = await ctx.evaluateArgs(ctx.getArgs());
    if (args[2]) {
      if (!hasObject(args[2])) {
        error.customError("Error object", "$setTimeout");
      }
    }
    await event.telegram?.timeoutManager.addTimeout(args[0], {
      milliseconds: args[1],
      data: args[2],
    });
  },
};
