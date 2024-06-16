import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sendDocument")
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
    name: "document",
    required: true,
    type: [ArgsType.String],
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
    name: "disable_content_type_detection",
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
      document,
      thumbnail,
      caption,
      parse_mode,
      caption_entities,
      disable_content_type_detection,
      disable_notification,
      protect_content,
      message_effect_id,
    ] = await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[document] && !document.startsWith("http")) {
      return func.reject(
        `The specified variable "${document}" does not exist for the file`,
      );
    }

    const result = await context.telegram.sendDocument({
      business_connection_id,
      chat_id,
      message_thread_id,
      document: document.startsWith("http") ? document : variableFile[document],
      thumbnail: thumbnail.startsWith("http")
        ? thumbnail
        : variableFile[thumbnail],
      caption,
      parse_mode,
      caption_entities,
      disable_content_type_detection,
      disable_notification,
      protect_content,
      message_effect_id,
      reply_parameters: context.getMessageOptions().reply_parameters,
      reply_markup: context.getMessageOptions().reply_markup,
    });

    return func.resolve(result);
  });
