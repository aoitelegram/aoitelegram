import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendChatAction")
  .setBrackets(true)
  .setFields({
    name: "action",
    required: false,
    type: [ArgsType.String],
    defaultValue: "typing",
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
    defaultValue: (context) =>
      context.eventData?.message_thread_id ||
      context.eventData.message?.message_thread_id,
  })
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [action, chat_id, message_thread_id, business_connection_id] =
      await func.resolveFields(context);

    const result = await context.telegram.sendChatAction({
      action,
      chat_id,
      message_thread_id,
      business_connection_id,
    });
    return func.resolve(result);
  });
