import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMessageReaction")
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
  .setFields({
    name: "reaction",
    required: false,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "is_big",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [chat_id, message_id, reaction, is_big] =
      await func.resolveFields(context);

    const result = await context.telegram.setMessageReaction({
      chat_id,
      message_id,
      reaction,
      is_big,
    });

    return func.resolve(result);
  });
