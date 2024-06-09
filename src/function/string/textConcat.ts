import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$textConcat")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "args",
    rest: true,
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [text, ...args] = await func.resolveFields(context);

    return func.resolve(text.concat(...args));
  });
