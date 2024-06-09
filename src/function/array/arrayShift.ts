import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayShift")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [array] = await func.resolveFields(context);
    const variableVar = context.variable.get(ArrayID);

    if (Array.isArray(array)) {
      return func.resolve(array.shift());
    }

    if (!variableVar?.[array]) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }
    const shift = variableVar[array].shift();
    context.variable.set(ArrayID, variableVar);
    return func.resolve(shift);
  });
