import { FileAnswerID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setStickerSetThumbnail")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "format",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "thumbnail",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, user_id, format, thumbnail] =
      await func.resolveFields(context);

    const variableFile = context.variable.get(FileAnswerID);

    if (!variableFile?.[thumbnail] && !thumbnail.startsWith("http")) {
      return func.reject(
        `The specified variable "${thumbnail}" does not exist for the file`,
      );
    }

    return func.resolve(
      await context.telegram.setStickerSetThumbnail({
        name,
        user_id,
        format,
        thumbnail: thumbnail.startsWith("http")
          ? thumbnail
          : variableFile[thumbnail],
      }),
    );
  });
