import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayMap")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "code",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [array, variable] = await func.resolveFields(context, [0, 1]);
    const variableVar = context.variable.get(ArrayID);
    let result: any[] = [];

    if (Array.isArray(array)) {
      result = array;
    }

    if (typeof array === "string") {
      if (!variableVar?.[array]) {
        return func.reject(
          `The specified variable "${array}" does not exist for the array`,
        );
      }
      result = variableVar[array];
    }

    for (let i = 0; i < result.length; i++) {
      context.variable.set(variable, result[i]);
      result[i] = await func.resolveCode(context, func.fields[2]);
    }

    return func.resolve(result);
  });
