import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$onlyIf")
  .setBrackets(true)
  .setFields({ name: "condition", type: [ArgsType.Any], required: true })
  .setFields({ name: "errorText", type: [ArgsType.Any], required: true })
  .onCallback(async (context, func) => {
    const [condition] = await func.resolveFields(context, [0]);
    if (!context.condition.checkCondition(condition)) {
      const [reason] = await func.resolveFields(context, [1]);
      return func.reject(reason, true);
    }
    return func.resolve();
  });
