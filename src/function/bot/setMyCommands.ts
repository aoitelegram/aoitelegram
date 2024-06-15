import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setMyCommands")
  .setBrackets(true)
  .setFields({
    name: "commands",
    required: true,
    type: [ArgsType.Array],
  })
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
    const [commands, scope, language_code] = await func.resolveFields(context);

    const result = await context.telegram.setMyCommands({
      commands,
      scope,
      language_code,
    });
    return func.resolve(result);
  });
