export default {
  name: "$replyMessage",
  callback: async (context) => {
    context.argsCheck(1);
    if (context.isError) return;

    const text = context.inside;
    const callback_query = context.callback_query;
    context.callback_query = [];
    return await context.event.reply(
      text,
      callback_query
        ? { reply_markup: { inline_keyboard: callback_query } }
        : undefined,
    );
  },
};
