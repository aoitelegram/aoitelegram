import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayAt")
  .setBrackets(true)
  .setFields({
    name: "name | array",
    required: true,
    type: [ArgsType.Array, ArgsType.String],
  })
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [array, index] = await func.resolveFields(context);

    if (Array.isArray(array)) {
      return func.resolve(array.at(index));
    }

    const variableArr = context.variable.get(ArrayID)?.[array];
    if (!variableArr) {
      return func.reject(
        `The specified variable "${array}" does not exist for the array`,
      );
    }

    return func.resolve(variableArr.at(index));
  });
