import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setChatStickerSet")
  .setBrackets(true)
  .setFields({
    name: "stickerToSet",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "chatId",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [stickerToSet, chatId] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setChatStickerSet(chatId, stickerToSet),
    );
  });
