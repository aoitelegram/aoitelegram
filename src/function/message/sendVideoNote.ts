import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendVideoNote")
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
    name: "video_note",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "duration",
    required: false,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "length",
    required: false,
    type: [ArgsType.Number],
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
      video_note,
      duration,
      length,
      thumbnail,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[video_note] && !video_note.startsWith("http")) {
      return func.reject(
        `The specified variable "${video_note}" does not exist for the file`,
      );
    }

    const result = await context.telegram.sendVideoNote({
      business_connection_id,
      chat_id,
      message_thread_id,
      video_note: video_note.startsWith("http")
        ? video_note
        : variableFile[video_note],
      duration,
      length,
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
