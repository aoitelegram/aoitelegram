import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$editMessageMedia")
  .setBrackets(true)
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
    name: "media",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [chat_id, message_id, inline_message_id, media] =
      await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);
    if (media.media?.startsWith("http")) {
      media.media = media.media;
    } else {
      if (!variableFile?.[media.media] && !media.media?.startsWith("http")) {
        throw new Error(
          `The specified variable "${media.media}" does not exist for the file`,
        );
      }
    }
    if ("thumbnail" in media && media.thumbnail?.startsWith("http")) {
      media.thumbnail = media.thumbnail;
    } else media.thumbnail = variableFile[media.thumbnail];

    const result = await context.telegram.editMessageMedia({
      chat_id,
      message_id,
      inline_message_id,
      media,
      reply_markup: context.getMessageOptions().reply_markup,
    });
    return func.resolve(result);
  });
