import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setStickerSetTitle")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "title",
    rest: true,
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, title] = await func.resolveFields(context);

    return func.resolve(await context.telegram.setStickerSetTitle(name, title));
  });
