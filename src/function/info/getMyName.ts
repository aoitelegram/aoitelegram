export default {
  name: "$getMyName",
  callback: async (context) => {
    const language_code = context.inside;
    const result = await context.telegram.getMyName(language_code);

    return result;
  },
};
