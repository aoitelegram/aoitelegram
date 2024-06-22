import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$seconds")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getSeconds());
  });
