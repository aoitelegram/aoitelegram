export default {
  name: "$setMyDescription",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$setMyDescription");
    const [description, language_code] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([description, language_code], error, [
      "string",
      "string | undefined",
    ]);

    const result = await event.telegram
      .setMyDescription(description, language_code)
      .catch((err) => err);

    return true;
  },
};
