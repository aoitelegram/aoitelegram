import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getUserChatBoosts")
  .setBrackets(true)
  .setFields({
    name: "user_id",
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
  .onCallback(async (context, func) => {
    const [user_id, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.getUserChatBoosts(chat_id, user_id);
    return func.resolve(result);
  });
