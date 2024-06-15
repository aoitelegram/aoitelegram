import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$promoteChatMember")
  .setBrackets(true)
  .setFields({
    name: "user_id",
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
  .setFields({
    name: "is_anonymous",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "permissions",
    required: false,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [user_id, chat_id, is_anonymous, permissions] =
      await func.resolveFields(context);

    const result = await context.telegram.promoteChatMember({
      user_id,
      chat_id,
      is_anonymous,
      ...(permissions || {}),
    });
    return func.resolve(result);
  });
