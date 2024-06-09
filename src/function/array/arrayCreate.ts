import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$arrayCreate")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "length",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 0,
  })
  .setFields({
    name: "value",
    rest: true,
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [name, length, ...value] = await func.resolveFields(context);
    const variableVar = context.variable.get(ArrayID);
    variableVar[name] = new Array(length);
    for (let i = 0; i < value.length; i++) {
      variableVar[name][i] = value[i];
    }

    context.variable.set(ArrayID, variableVar);
    return func.resolve(true);
  });
