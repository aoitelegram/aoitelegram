export default {
  name: "$getMyName",
  callback: async (ctx, event, database, error) => {
    const [language_code] = await ctx.getEvaluateArgs();
    const result = await event.telegram
      .getMyName(language_code)
      .catch(() => undefined);

    return result;
  },
};
