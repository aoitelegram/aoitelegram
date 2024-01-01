import { isValidChat } from "../helpers";

export default {
  name: "$addCustomReaction",
  callback: async (ctx, event, database, error) => {
    ctx.argsCheck(1, error, "$addCustomReaction");
    const [
      custom_emoji,
      is_big = true,
      message_id = event.message_id || event.message?.message_id,
      chatId = event.chat?.id || event.message?.chat.id,
    ] = await ctx.getEvaluateArgs();
    ctx.checkArgumentTypes([custom_emoji, is_big, message_id, chatId], error, [
      "string",
      "boolean",
      "number",
      "number | string",
    ]);

    if (!(await isValidChat(event, chatId))) {
      error.customError("Invalid Chat Id", "$addCustomReaction");
      return;
    }

    const result = await event.telegram
      .setMessageReaction({
        chat_id: chatId,
        message_id,
        reaction: [{ type: "custom_emoji", custom_emoji }],
      })
      .catch(() => null);

    if (!result) {
      error.customError("Invalid customEmoji/messageId", "$addCustomReaction");
    }

    return true;
  },
};
