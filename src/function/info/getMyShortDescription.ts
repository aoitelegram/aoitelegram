export default {
  name: "$getMyShortDescription",
  callback: async (ctx, event, database, error) => {
    const [language_code] = await ctx.getEvaluateArgs();
    const result = await event.telegram
      .getMyShortDescription(language_code)
      .catch(() => undefined);

    return result;
  },
};
