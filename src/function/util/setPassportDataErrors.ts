import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$setPassportDataErrors")
  .setBrackets(true)
  .setFields({
    name: "user_id",
    required: true,
    type: [ArgsType.Chat],
  })
  .setFields({
    name: "errors",
    required: true,
    type: [ArgsType.Array],
  })
  .onCallback(async (context, func) => {
    const [user_id, errors] = await func.resolveFields(context);

    await context.telegram.setPassportDataErrors(user_id, errors);

    return func.resolve(true);
  });
