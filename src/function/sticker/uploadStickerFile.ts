import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$uploadStickerFile")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "sticker_format",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "sticker",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [user_id, sticker_format, sticker] =
      await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[sticker] && !sticker.startsWith("http")) {
      return func.reject(
        `The specified variable "${sticker}" does not exist for the file`,
      );
    }

    return func.resolve(
      await context.telegram.uploadStickerFile({
        user_id,
        sticker_format,
        sticker: sticker.startsWith("http") ? sticker : variableFile[sticker],
      }),
    );
  });
