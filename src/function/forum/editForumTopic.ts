import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editForumTopic")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "message_thread_id",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "name",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "icon_custom_emoji_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [chat_id, message_thread_id, name, icon_custom_emoji_id] =
      await func.resolveFields(context);
    const result = await context.telegram.editForumTopic({
      name,
      chat_id,
      message_thread_id,
      icon_custom_emoji_id,
    });
    return func.resolve(result);
  });
