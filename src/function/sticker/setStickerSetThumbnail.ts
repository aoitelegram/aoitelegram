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
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, user_id, format, thumbnail] =
      await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setStickerSetThumbnail({
        name,
        user_id,
        format,
        thumbnail: thumbnail.startsWith("http")
          ? thumbnail
          : context.variable.get(FileAnswerID),
      }),
    );
  });
