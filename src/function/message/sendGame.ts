import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendGame")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "game_short_name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "disable_notification",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "protect_content",
    required: false,
    type: [ArgsType.Boolean],
  })
  .setFields({
    name: "message_effect_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      chat_id,
      game_short_name,
      business_connection_id,
      message_thread_id,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const message = await context.telegram.sendGame({
      chat_id,
      game_short_name,
      business_connection_id,
      message_thread_id,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(message);
  });
