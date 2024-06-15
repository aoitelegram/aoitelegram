import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatPermissions")
  .setBrackets(true)
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
  .onCallback(async (context, func) => {
    const [permissions, chat_id, use_independent_chat_permissions] =
      await func.resolveFields(context);

    const result = await context.telegram.setChatPermissions({
      permissions,
      chat_id,
      use_independent_chat_permissions,
    });
    return func.resolve(result);
  });
