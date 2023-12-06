export default {
  name: "$sendChatAction",
  callback: async (ctx, event, database, error) => {
    const chat = event.chat?.id || event.message?.chat.id;
    const [action = "typing", chatId = chat] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([action, chatId], error, [
      "string",
      "number | string",
    ]);
    event.telegram.sendChatAction({
      chat_id: chatId,
      action,
    });
    return undefined;
  },
};
