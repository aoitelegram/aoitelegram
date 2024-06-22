import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$toLocaleDateString")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().toLocaleDateString());
  });
