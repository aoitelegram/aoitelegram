import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$revokeChatInviteLink")
  .setBrackets(true)
  .setFields({
    name: "invite_link",
    required: true,
    type: [ArgsType.Url],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [invite_link, chat_id] = await func.resolveFields(context);

    const result = await context.telegram.revokeChatInviteLink(
      chat_id,
      invite_link,
    );
    return func.resolve(result);
  });
