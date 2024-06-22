import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$hour")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getHours());
  });
