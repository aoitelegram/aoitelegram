export default {
  name: "$clientSupportsInlineQueries",
  callback: async (ctx, event, database, error) => {
    const getMe = await event.telegram?.getMe();
    return getMe.supports_inline_queries;
  },
};
