import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$elseIf")
  .setBrackets(true)
  .setFields({ name: "condition", type: [ArgsType.String], required: true })
  .onCallback(async (context, func) => {
    return func.resolve();
  });
