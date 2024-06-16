import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteMessage")
  .setBrackets(true)
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
    const [chat_id, message_id] = await func.resolveFields(context);

    const result = await context.telegram.deleteMessage(chat_id, message_id);

    return func.resolve(result);
  });
