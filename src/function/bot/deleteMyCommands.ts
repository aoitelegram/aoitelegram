import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteMyCommands")
  .setBrackets(true)
  .setFields({
    name: "scope",
    required: false,
    type: [ArgsType.Object],
  })
  .setFields({
    name: "language_code",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [scope, language_code] = await func.resolveFields(context);

    const result = await context.telegram.deleteMyCommands(
      scope,
      language_code,
    );
    return func.resolve(result);
  });
