import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$elseIf")
  .setBrackets(true)
  .setFields({ required: true })
  .onCallback(async (context, func) => {
    return func.resolve();
  });
