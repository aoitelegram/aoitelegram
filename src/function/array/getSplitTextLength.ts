import { SplitTextID } from "../index";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getSplitTextLength")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(context.variable.get(SplitTextID).length);
  });
