import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$suppressErrors")
  .setBrackets(true)
  .setFields({
    name: "str",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [str] = await func.resolveFields(context);
    context.setSuppressErrors(str);
    return func.resolve();
  });
