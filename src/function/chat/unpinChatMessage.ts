import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$unpinChatMessage")
  .setBrackets(true)
  .setFields({
    name: "message_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [message_id, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.unpinChatMessage(chat_id, message_id);
    return func.resolve(result);
  });
