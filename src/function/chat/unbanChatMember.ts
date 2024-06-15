import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$unbanChatMember")
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
    name: "only_if_banned",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [user_id, chat_id, only_if_banned] =
      await func.resolveFields(context);

    const result = await context.telegram.unbanChatMember({
      user_id,
      chat_id,
      only_if_banned,
    });
    return func.resolve(result);
  });
