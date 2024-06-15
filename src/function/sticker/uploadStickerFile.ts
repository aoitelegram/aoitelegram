import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$uploadStickerFile")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "sticker_format",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "sticker",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [user_id, sticker_format, sticker] =
      await func.resolveFields(context);

    return func.resolve(
      await context.telegram.uploadStickerFile({
        user_id,
        sticker_format,
        sticker: sticker ? sticker : context.variable.get(FileAnswerID),
      }),
    );
  });
