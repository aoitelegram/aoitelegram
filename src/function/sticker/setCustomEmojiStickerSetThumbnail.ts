import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setCustomEmojiStickerSetThumbnail")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "custom_emoji_id",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, custom_emoji_id] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setCustomEmojiStickerSetThumbnail(
        name,
        custom_emoji_id,
      ),
    );
  });
