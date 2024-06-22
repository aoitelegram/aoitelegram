import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$year")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getFullYear());
  });
