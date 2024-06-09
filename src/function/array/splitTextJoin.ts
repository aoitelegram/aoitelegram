import { SplitTextID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$splitTextJoin")
  .setBrackets(true)
  .setFields({
    name: "sep",
    required: false,
    type: [ArgsType.Any],
    defaultValue: ", ",
  })
  .onCallback(async (context, func) => {
    const [sep] = await func.resolveFields(context);
    return func.resolve(context.variable.get(SplitTextID).join(sep));
  });
