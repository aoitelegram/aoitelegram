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

    await context.telegram.setMyCommands({
      language_code,
      scope,
      commands: commands,
    });

    return true;
  },
};
