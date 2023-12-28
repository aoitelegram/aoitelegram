export default {
  name: "$setMyShortDescription",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$setMyShortDescription");
    const [description, language_code] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([description, language_code], error, [
      "string",
      "string | undefined",
    ]);

    const result = await event.telegram
      .setMyShortDescription(description, language_code)
      .catch((err) => err);

    return true;
  },
};
