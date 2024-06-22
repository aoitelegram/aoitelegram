import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$stopPoll")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_id",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [business_connection_id, chat_id, message_id] =
      await func.resolveFields(context);

    const result = await context.telegram.stopPoll({
      business_connection_id,
      chat_id,
      message_id,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
