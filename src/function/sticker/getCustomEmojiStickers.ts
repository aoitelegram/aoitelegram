import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getCustomEmojiStickers")
  .setBrackets(true)
  .setFields({
    name: "custom_emoji_ids",
    rest: true,
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [custom_emoji_ids] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.getCustomEmojiStickers(custom_emoji_ids),
    );
  });
