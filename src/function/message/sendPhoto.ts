import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendPhoto")
  .setBrackets(true)
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "photo",
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
    name: "has_spoiler",
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
  .setFields({
    name: "message_effect_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [
      chat_id,
      photo,
      business_connection_id,
      message_thread_id,
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
      has_spoiler,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[photo] && !photo.startsWith("http")) {
      return func.reject(
        `The specified variable "${photo}" does not exist for the file`,
      );
    }

    const result = await context.telegram.sendPhoto({
      business_connection_id,
      chat_id,
      message_thread_id,
      photo: photo.startsWith("http") ? photo : variableFile[photo],
      caption,
      parse_mode,
      caption_entities,
      show_caption_above_media,
      has_spoiler,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
