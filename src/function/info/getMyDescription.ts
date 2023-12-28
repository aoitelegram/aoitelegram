export default {
  name: "$getMyDescription",
  callback: async (ctx, event, database, error) => {
    const [language_code] = await ctx.getEvaluateArgs();
    const result = await event.telegram
      .getMyDescription(language_code)
      .catch(() => undefined);

    return result;
  },
};
