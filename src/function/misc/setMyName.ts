export default {
  name: "$setMyName",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$setMyName");
    const [name, language_code] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([name, language_code], error, [
      "string",
      "string | undefined",
    ]);

    const result = await event.telegram
      .setMyName(name, language_code)
      .catch((err) => err);

    return true;
  },
};
