import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMyName")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: false,
    type: [ArgsType.String],
  })
  .setFields({
    name: "language_code",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [name, language_code] = await func.resolveFields(context);

    const result = await context.telegram.setMyName(name, language_code);
    return func.resolve(result);
  });
