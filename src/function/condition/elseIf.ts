import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$elseIf")
  .setBrackets(true)
  .setFields({ name: "condition", type: [ArgsType.Any], required: true })
  .onCallback(async (context, func) => {
    return func.resolve();
  });
