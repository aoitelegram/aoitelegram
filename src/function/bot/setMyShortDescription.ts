import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMyShortDescription")
  .setBrackets(true)
  .setFields({
    name: "short_description",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "language_code",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [short_description, language_code] =
      await func.resolveFields(context);

    const result = await context.telegram.setMyShortDescription(
      short_description,
      language_code,
    );
    return func.resolve(result);
  });
