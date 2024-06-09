import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayFill")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [name, value] = await func.resolveFields(context);
    const variableArr = context.variable.get(ArrayID);

    if (!variableArr?.[name]) {
      return func.reject(
        `The specified variable "${name}" does not exist for the array`,
      );
    }

    variableArr[name] = variableArr[name].fill(value);
    context.variable.set(ArrayID, variableArr);
    return func.resolve(true);
  });
