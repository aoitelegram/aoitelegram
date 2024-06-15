import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createChatInviteLink")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .setFields({
    name: "name",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "expire_date",
    required: false,
    type: [ArgsType.Time],
  })
  .setFields({
    name: "member_limit",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "creates_join_request",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [chat_id, name, expire_date, member_limit, creates_join_request] =
      await func.resolveFields(context);

    const result = await context.telegram.createChatInviteLink({
      chat_id,
      name,
      expire_date: expire_date?.ms,
      member_limit,
      creates_join_request,
    });
    return func.resolve(result);
  });
