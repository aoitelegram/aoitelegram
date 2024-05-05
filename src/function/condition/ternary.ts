import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$ternary")
  .setBrackets(true)
  .setFields({ name: "condition", type: [ArgsType.String], required: true })
  .setFields({ name: "conditionTrue", type: [ArgsType.String], required: true })
  .setFields({
    name: "conditionFalse",
    type: [ArgsType.String],
    required: false,
  })
  .onCallback(async (context, func) => {
    const [condition] = await func.resolveFields(context, [0]);
    if (context.condition.checkCondition(condition)) {
      return func.resolve(await func.resolveCode(context, func.fields[1]));
    } else if (func.fields[2]) {
      return func.resolve(await func.resolveCode(context, func.fields[2]));
    }
    return func.resolve();
  });
