export default {
  name: "$sendPhoto",
  callback: async (context) => {
    context.argsCheck(1);
    const [
      photo,
      chatId = context.event.chat?.id || context.event.message?.chat.id,
    ] = context.splits;
    if (context.isError) return;

    await context.telegram.sendPhoto({
      chat_id: chatId,
      photo: photo.startsWith("http") ? photo : { source: photo },
    });
  },
};
