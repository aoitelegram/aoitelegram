import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$textAt")
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

    const resultIndex = index - 1 < 0 ? text.length + index - 1 : index - 1;
    const result = text[resultIndex];
    return func.resolve(result);
  });
