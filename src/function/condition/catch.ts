import { SymbolID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$catch")
  .setBrackets(true)
  .setFields({
    name: "variable",
    type: [ArgsType.Any],
    required: false,
  })
  .onCallback(async (context, func) => {
    context.variable.set(SymbolID, await func.resolveAllFields(context));
    return func.resolve();
  });
