import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$textSlice")
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

    const result = text.slice(index - 1 >= 0 ? index - 1 : index);
    return func.resolve(result);
  });
