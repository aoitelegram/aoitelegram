import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$createNewStickerSet")
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
    name: "title",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "stickers",
    required: true,
    type: [ArgsType.Array],
  })
  .setFields({
    name: "sticker_type",
    required: false,
    type: [ArgsType.String],
    defaultValue: "regular",
  })
  .setFields({
    name: "needs_repainting",
    required: false,
    type: [ArgsType.Boolean],
  })
  .onCallback(async (context, func) => {
    const [user_id, name, title, stickers, sticker_type, needs_repainting] =
      await func.resolveFields(context);

    stickers.map((item: any) => {
      if (typeof item === "object") {
        if (item.sticker?.startsWith("http")) {
          item.sticker = item.sticker;
        } else {
          const variableFile = context.variable.get(FileAnswerID);
          if (!variableFile?.[item.sticker]) {
            throw new Error(
              `The specified variable "${item.sticker}" does not exist for the file`,
            );
          }
          item.sticker = variableFile[item.sticker];
        }
        return item;
      }
      return item;
    });

    const result = await context.telegram.createNewStickerSet({
      user_id,
      name,
      title,
      stickers,
      sticker_type,
      needs_repainting,
    });

    return func.resolve(result === true);
  });
