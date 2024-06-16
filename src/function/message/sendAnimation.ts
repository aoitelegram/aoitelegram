import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendAnimation")
  .setBrackets(true)
  .setFields({
    name: "business_connection_id",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chat_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "message_thread_id",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "animation",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "duration",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "width",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "height",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "thumbnail",
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
      business_connection_id,
      chat_id,
      message_thread_id,
      animation,
      duration,
      width,
      height,
      thumbnail,
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

    if (!variableFile?.[animation] && !animation.startsWith("http")) {
      return func.reject(
        `The specified variable "${animation}" does not exist for the file`,
      );
    }

    const result = await context.telegram.sendAnimation({
      business_connection_id,
      chat_id,
      message_thread_id,
      animation: animation.startsWith("http")
        ? animation
        : variableFile[animation],
      duration,
      width,
      height,
      thumbnail: thumbnail.startsWith("http")
        ? thumbnail
        : variableFile[thumbnail],
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
