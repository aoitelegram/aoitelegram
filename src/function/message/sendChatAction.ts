import { isValidChat } from "../helpers";

export default {
  name: "$sendChatAction",
  callback: async (context) => {
    const [
      action = "typing",
      chatId = context.event.chat?.id || context.event.message?.chat.id,
    ] = context.splits;
    context.checkArgumentTypes(["string", "number | string"]);
    if (context.isError) return;

    if (!(await isValidChat(context.event, chatId))) {
      context.sendError("Invalid Chat Id");
      return;
    }

    context.telegram.sendChatAction({
      chat_id: chatId,
      action,
    });
    return undefined;
  },
};
