import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$checkCondition")
  .setBrackets(true)
  .setFields({
    name: "condition",
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
  })
  .onCallback(async (context, func) => {
    const resolvedArgs = await func.resolveAllFields(context);
    return func.resolve(context.condition.checkCondition(resolvedArgs));
  });
