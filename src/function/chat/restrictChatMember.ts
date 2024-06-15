import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$restrictChatMember")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "permissions",
    required: true,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "use_independent_chat_permissions",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "until_date",
    required: false,
    type: [ArgsType.Time],
  })
  .onCallback(async (context, func) => {
    const [
      user_id,
      permissions,
      chat_id,
      use_independent_chat_permissions,
      until_date,
    ] = await func.resolveFields(context);

    const result = await context.telegram.restrictChatMember({
      user_id,
      permissions,
      chat_id,
      use_independent_chat_permissions,
      until_date: until_date?.ms,
    });
    return func.resolve(result);
  });
