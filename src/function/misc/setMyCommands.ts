export default {
  name: "$setMyCommands",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(3, error, "$setMyCommands");
    const [language_code, scope = {}, ...commands] =
      await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([language_code, scope, ...commands], error, [
      "string | undefined",
      "object | undefined",
      "...unknown",
    ]);

    const result = await event.telegram
      .setMyCommands({
        language_code,
        scope,
        commands: commands,
      })
      .catch((err) => err);

    if (typeof result !== "boolean") {
      error.customError("Failed to usage in", "$setMyCommands");
      return;
    }

    return true;
  },
};
