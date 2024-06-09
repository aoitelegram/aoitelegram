import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayLength")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [array] = await func.resolveFields(context);
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

    return func.resolve(result.length);
  });
