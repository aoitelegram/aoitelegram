import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$banChatMember")
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
    name: "until_date",
    required: false,
    type: [ArgsType.Time],
  })
  .setFields({
    name: "revoke_messages",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [user_id, chat_id, until_date, revoke_messages] =
      await func.resolveFields(context);

    const result = await context.telegram.banChatMember({
      user_id,
      chat_id,
      until_date: until_date?.ms,
      revoke_messages,
    });
    return func.resolve(result);
  });
