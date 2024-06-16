import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replaceStickerInSet")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "old_sticker",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "sticker",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [user_id, name, old_sticker, sticker] =
      await func.resolveFields(context);

    if (typeof sticker === "object") {
      if (sticker.sticker?.startsWith("http")) {
        sticker.sticker = sticker.sticker;
      } else {
        const variableFile = context.variable.get(FileAnswerID);

        if (
          !variableFile?.[sticker.sticker] &&
          !sticker.sticker?.startsWith("http")
        ) {
          return func.reject(
            `The specified variable "${sticker.sticker}" does not exist for the file`,
          );
        }
        sticker.sticker = variableFile[sticker.sticker];
      }
    }

    return func.resolve(
      await context.telegram.replaceStickerInSet({
        user_id,
        name,
        old_sticker,
        sticker,
      }),
    );
  });
