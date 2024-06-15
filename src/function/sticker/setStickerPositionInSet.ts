import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setStickerPositionInSet")
  .setBrackets(true)
  .setFields({
    name: "sticker",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "position",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [sticker, position] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setStickerPositionInSet(sticker, position),
    );
  });
