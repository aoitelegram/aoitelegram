import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendMessage")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
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
    name: "parse_mode",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "entities",
    required: false,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "link_preview_options",
    required: false,
    type: [ArgsType.Object],
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
      text,
      chat_id,
      business_connection_id,
      message_thread_id,
      parse_mode,
      entities,
      link_preview_options,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const result = await context.telegram.sendMessage({
      text,
      chat_id,
      business_connection_id,
      message_thread_id,
      parse_mode,
      entities,
      link_preview_options,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
