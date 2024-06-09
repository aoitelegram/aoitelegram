import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayClear")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [array] = await func.resolveFields(context);

    if (Array.isArray(array)) {
      array.length = 0;
      return func.resolve(array);
    }

    const variableArr = context.variable.get(ArrayID);
    if (!variableArr?.[array]) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }
    variableArr[array] = [];
    context.variable.set(ArrayID, variableArr);
    return func.resolve([]);
  });
