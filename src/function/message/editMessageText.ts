import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editMessageText")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "text",
    required: true,
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
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      business_connection_id,
      text,
      chat_id,
      message_id,
      inline_message_id,
      parse_mode,
      entities,
      link_preview_options,
    ] = await func.resolveFields(context);

    const result = await context.telegram.editMessageText({
      business_connection_id,
      chat_id,
      message_id,
      inline_message_id,
      text,
      parse_mode,
      entities,
      link_preview_options,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
