import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getGameHighScores")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
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
    const [user_id, chat_id, message_id, inline_message_id] =
      await func.resolveFields(context);

    const scores = await context.telegram.getGameHighScores({
      user_id,
      chat_id,
      message_id,
      inline_message_id,
    });
    return func.resolve(scores);
  });
