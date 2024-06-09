import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$textIndexOf")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "search",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text, search] = await func.resolveFields(context);

    return func.resolve(text.indexOf(search));
  });
