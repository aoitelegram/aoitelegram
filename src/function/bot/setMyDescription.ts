import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMyDescription")
  .setBrackets(true)
  .setFields({
    name: "description",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "language_code",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [description, language_code] = await func.resolveFields(context);

    const result = await context.telegram.setMyDescription(
      description,
      language_code,
    );
    return func.resolve(result);
  });
