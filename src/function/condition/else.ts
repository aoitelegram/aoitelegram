import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$else")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve();
  });
