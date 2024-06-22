import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$findSpecialChars")
  .setBrackets(true)
  .setFields({
    name: "str",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [str] = await func.resolveFields(context);
    return func.resolve(str.replace(/(\w+)/g, ""));
  });
