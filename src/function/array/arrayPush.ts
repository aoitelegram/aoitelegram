import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayPush")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .setFields({
    name: "values",
    rest: true,
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [array, ...values] = await func.resolveFields(context);
    const variableVar = context.variable.get(ArrayID);

    if (Array.isArray(array)) {
      array.push(...values);
      return func.resolve(array);
    }

    if (!variableVar?.[array]) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }
    variableVar[array].push(...values);
    context.variable.set(ArrayID, variableVar);
    return func.resolve(variableVar[array].length);
  });
