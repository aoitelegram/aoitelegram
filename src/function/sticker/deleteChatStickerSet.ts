import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteChatStickerSet")
  .setBrackets(true)
  .setFields({
    name: "chatId",
    required: false,
    type: [ArgsType.Chat],
    defaultValue: (context) =>
      context.eventData.chat?.id || context.eventData.message?.chat.id,
  })
  .onCallback(async (context, func) => {
    const [chatId] = await func.resolveFields(context);

    return func.resolve(await context.telegram.deleteChatStickerSet(chatId));
  });
