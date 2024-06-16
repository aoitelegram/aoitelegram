import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteMessages")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_ids",
    required: true,
    type: [ArgsType.Array],
  })
  .onCallback(async (context, func) => {
    const [chat_id, message_ids] = await func.resolveFields(context);

    const result = await context.telegram.deleteMessages(chat_id, message_ids);

    return func.resolve(result);
  });
