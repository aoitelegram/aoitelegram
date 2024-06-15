import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$banChatSenderChat")
  .setBrackets(true)
  .setFields({
    name: "sender_chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [sender_chat_id, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.banChatSenderChat(
      chat_id,
      sender_chat_id,
    );
    return func.resolve(result);
  });
