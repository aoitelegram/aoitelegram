import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatAdministratorCustomTitle")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "custom_title",
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
    const [user_id, custom_title, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.setChatAdministratorCustomTitle({
      user_id,
      custom_title,
      chat_id,
    });
    return func.resolve(result);
  });
