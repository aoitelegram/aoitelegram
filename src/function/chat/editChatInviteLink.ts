import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editChatInviteLink")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "invite_link",
    required: true,
    type: [ArgsType.Url],
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
    const [
      chat_id,
      invite_link,
      name,
      expire_date,
      member_limit,
      creates_join_request,
    ] = await func.resolveFields(context);

    const result = await context.telegram.editChatInviteLink({
      chat_id,
      invite_link,
      name,
      expire_date: expire_date?.ms,
      member_limit,
      creates_join_request,
    });
    return func.resolve(result);
  });
