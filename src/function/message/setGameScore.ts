import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setGameScore")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "score",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "force",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "disable_edit_message",
    required: false,
    type: [ArgsType.Boolean],
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
    const [
      user_id,
      score,
      force,
      disable_edit_message,
      chat_id,
      message_id,
      inline_message_id,
    ] = await func.resolveFields(context);

    const result = await context.telegram.setGameScore({
      user_id,
      score,
      force,
      disable_edit_message,
      chat_id,
      message_id,
      inline_message_id,
    });
    return func.resolve(result);
  });
