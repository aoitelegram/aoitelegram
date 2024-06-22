import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$milliseconds")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getMilliseconds());
  });
