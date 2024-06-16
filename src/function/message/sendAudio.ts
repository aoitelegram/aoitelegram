import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendAudio")
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
    name: "audio",
    required: true,
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
    name: "duration",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "performer",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "title",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "thumbnail",
    required: false,
    type: [ArgsType.String],
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
      audio,
      caption,
      parse_mode,
      caption_entities,
      duration,
      performer,
      title,
      thumbnail,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[audio] && !audio.startsWith("http")) {
      return func.reject(
        `The specified variable "${audio}" does not exist for the file`,
      );
    }

    const result = await context.telegram.sendAudio({
      business_connection_id,
      chat_id,
      message_thread_id,
      audio: audio.startsWith("http") ? audio : variableFile[audio],
      caption,
      parse_mode,
      caption_entities,
      duration,
      performer,
      title,
      thumbnail: thumbnail.startsWith("http")
        ? thumbnail
        : variableFile[thumbnail],
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
