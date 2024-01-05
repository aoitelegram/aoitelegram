import { isValidChat } from "../helpers";

export default {
  name: "$chatSendMessage",
  callback: async (context) => {
    context.argsCheck(2);
    const [chatId, content] = context.splits;
    context.checkArgumentTypes(["number | string", "unknown"]);

    if (context.isError) return;

    if (!(await isValidChat(context.event, chatId))) {
      context.sendError("Invalid Chat Id");
      return;
    }

    return await context.telegram.sendMessage(chatId, content);
  },
};
