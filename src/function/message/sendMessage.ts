export default {
  name: "$sendMessage",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$sendMessage");
    const [
      text,
      parse_mode,
      disable_web_page_preview,
      disable_notification,
      protect_content,
      allow_sending_without_reply,
    ] = await ctx.getEvaluateArgs();
    const callback_query = ctx.callback_query;
    ctx.callback_query = [];
    return await event.send(
      text,
      callback_query
        ? {
            reply_markup: { inline_keyboard: callback_query },
            parse_mode,
            disable_web_page_preview,
            disable_notification,
            protect_content,
            allow_sending_without_reply,
          }
        : {
            parse_mode,
            disable_web_page_preview,
            disable_notification,
            protect_content,
            allow_sending_without_reply,
          },
    );
  },
};
