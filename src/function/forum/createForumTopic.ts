import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createForumTopic")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "icon_color",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "icon_custom_emoji_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, chat_id, icon_color, icon_custom_emoji_id] =
      await func.resolveFields(context);
    const result = await context.telegram.createForumTopic({
      name,
      chat_id,
      icon_color,
      icon_custom_emoji_id,
    });
    return func.resolve(result);
  });
