import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$copyMessage")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "from_chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_id",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "caption",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "parse_mode",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "caption_entities",
    required: false,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "show_caption_above_media",
    required: false,
    type: [ArgsType.Boolean],
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
  .onCallback(async (context, func) => {
    const [
      chat_id,
      from_chat_id,
      message_id,
      message_thread_id,
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
      disable_notification,
      protect_content,
    ] = await func.resolveFields(context);

    const result = await context.telegram.copyMessage({
      chat_id,
      message_thread_id,
      from_chat_id,
      message_id,
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
      disable_notification,
      protect_content,
      reply_parameters: context.getMessageOptions().reply_markup,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
