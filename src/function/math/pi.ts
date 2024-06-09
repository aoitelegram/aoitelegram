import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$pi")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(Math.PI);
  });
