import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$and")
  .setBrackets(true)
  .setFields({
    name: "condition",
    rest: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
    required: true,
  })
  .onCallback(async (context, func) => {
    const resolvedArgs = await func.resolveFields(context);
    return func.resolve(
      context.condition.checkCondition(resolvedArgs.join("&&")),
    );
  });
