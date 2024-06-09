import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$maxSafeInteger")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(Number.MAX_SAFE_INTEGER);
  });
