export default {
  name: "$chatSendMessage",
  callback: async (context) => {
    context.argsCheck(2);
    const [chatId, content] = context.splits;
    context.checkArgumentTypes(["number | string", "unknown"]);

    if (context.isError) return;

    return await context.telegram.sendMessage(chatId, content);
  },
};
