export default {
  name: "$clientSupportsInlineQueries",
  callback: async (context) => {
    const getMe = await context.telegram.getMe();
    return getMe.supports_inline_queries;
  },
};
