import { SplitTextID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$textSplit")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "sep",
    required: false,
    type: [ArgsType.Any],
    defaultValue: ", ",
  })
  .onCallback(async (context, func) => {
    const [value, sep] = await func.resolveFields(context);
    context.variable.set(SplitTextID, value.split(sep));
    return func.resolve();
  });
