import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editMessageReplyMarkup")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: false,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "inline_message_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [business_connection_id, chat_id, message_id, inline_message_id] =
      await func.resolveFields(context);

    const result = await context.telegram.editMessageReplyMarkup({
      business_connection_id,
      chat_id,
      message_id,
      inline_message_id,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
