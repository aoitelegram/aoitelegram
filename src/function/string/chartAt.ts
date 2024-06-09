import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$charAt")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [text, index] = await func.resolveFields(context);

    return func.resolve(text.charAt(index - 1));
  });
