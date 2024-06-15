import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getMyDescription")
  .setBrackets(true)
  .setFields({
    name: "language_code",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [language_code] = await func.resolveFields(context);

    const result = await context.telegram.getMyDescription(language_code);
    return func.resolve(result);
  });
