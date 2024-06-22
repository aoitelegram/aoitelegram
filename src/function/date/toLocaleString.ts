import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$toLocaleString")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().toLocaleString());
  });
