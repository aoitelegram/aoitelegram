import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayUnshift")
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
      return func.resolve(array.unshift());
    }

    if (!variableVar?.[array]) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }
    const unshift = variableVar[array].unshift();
    context.variable.set(ArrayID, variableVar);
    return func.resolve(unshift);
  });
