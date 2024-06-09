import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayReverse")
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
      return func.resolve(array.reverse());
    }

    if (!variableVar?.[array]) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }
    variableVar[array].reverse();
    context.variable.set(ArrayID, variableVar);
    return func.resolve(variableVar[array]);
  });
