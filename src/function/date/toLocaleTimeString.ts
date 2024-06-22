import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$toLocaleTimeString")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().toLocaleTimeString());
  });
