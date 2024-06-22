import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$minutes")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getMinutes());
  });
