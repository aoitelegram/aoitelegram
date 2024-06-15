import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteStickerSet")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);

    return func.resolve(await context.telegram.deleteStickerSet(name));
  });
