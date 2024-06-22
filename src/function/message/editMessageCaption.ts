import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editMessageCaption")
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
    name: "reply_markup",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      business_connection_id,
      chat_id,
      message_id,
      inline_message_id,
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
    ] = await func.resolveFields(context);

    const result = await context.telegram.editMessageCaption({
      business_connection_id,
      chat_id,
      message_id,
      inline_message_id,
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
