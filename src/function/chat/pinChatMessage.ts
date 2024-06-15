import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$pinChatMessage")
  .setBrackets(true)
  .setFields({
    name: "message_id",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "disable_notification",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [message_id, chat_id, disable_notification] =
      await func.resolveFields(context);

    const result = await context.telegram.pinChatMessage({
      chat_id,
      message_id,
      disable_notification,
    });
    return func.resolve(result);
  });
