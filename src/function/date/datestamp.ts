import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$datestamp")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(Date.now());
  });
