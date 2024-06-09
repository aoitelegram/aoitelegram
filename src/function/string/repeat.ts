import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$repeat")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "count",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [text, count] = await func.resolveFields(context);

    return func.resolve(text.repeat(count));
  });
