import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$split")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "sep",
    required: false,
    type: [ArgsType.String],
    defaultValue: ", ",
  })
  .onCallback(async (context, func) => {
    const [text, sep = ", "] = await func.resolveFields(context);

    return func.resolve(text.split(sep));
  });
