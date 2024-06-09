import { SplitTextID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$splitText")
  .setBrackets(true)
  .setFields({
    name: "index",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [index] = await func.resolveFields(context);
    return func.resolve(context.variable.get(SplitTextID).at(index));
  });
