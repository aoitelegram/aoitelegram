export default {
  name: "$getMyShortDescription",
  callback: async (context) => {
    const language_code = context.inside;
    const result = await context.telegram.getMyShortDescription(language_code);

    return result;
  },
};
