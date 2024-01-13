export default {
  name: "$getChatMemberCount",
  callback: async (context) => {
    const [chatId = context.event.chat?.id || context.event.message?.chat.id] =
      context.splits;
    context.checkArgumentTypes(["string | number | undefined"]);

    if (context.isError) return;

    const result = await context.telegram.getChatMemberCount(chatId);

    return result;
  },
};
