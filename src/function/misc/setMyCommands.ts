export default {
  name: "$setMyCommands",
  callback: async (context) => {
    context.argsCheck(3);
    const [language_code, scope = {}, ...commands] = context.splits;
    context.checkArgumentTypes([
      "string | undefined",
      "object | undefined",
      "...unknown",
    ]);
    if (context.isError) return;

    const result = await context.telegram
      .setMyCommands({
        language_code,
        scope,
        commands: commands,
      })
      .catch((err) => console.log(err));

    if (typeof result !== "boolean") {
      context.sendError("Failed to usage");
      return;
    }

    return true;
  },
};
