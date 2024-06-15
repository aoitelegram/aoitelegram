import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$minSafeInteger")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(Number.MIN_SAFE_INTEGER);
  });
