import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setStickerEmojiList")
  .setBrackets(true)
  .setFields({
    name: "sticker",
    required: true,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "emoji_list",
    rest: true,
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [sticker, ...emoji_list] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setStickerEmojiList(sticker, emoji_list),
    );
  });
