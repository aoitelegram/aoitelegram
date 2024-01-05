export default {
  name: "$sendMessage",
  callback: async (context) => {
    context.argsCheck(1);
    const text = context.inside;
    if (context.isError) return;

    const callback_query = context.callback_query;
    context.callback_query = [];
    return await context.event.send(
      text,
      callback_query
        ? {
            reply_markup: { inline_keyboard: callback_query },
          }
        : {},
    );
  },
};
