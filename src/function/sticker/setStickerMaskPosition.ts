import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setStickerMaskPosition")
  .setBrackets(true)
  .setFields({
    name: "sticker",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "mask_position",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [sticker, mask_position] = await func.resolveFields(context);

    return func.resolve(
      await context.telegram.setStickerMaskPosition(sticker, mask_position),
    );
  });
