import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$toUpperCase")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text] = await func.resolveFields(context);

    return func.resolve(text.toUpperCase());
  });
