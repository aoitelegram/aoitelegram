import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$endIf")
  .setBrackets(false)
  .onCallback(async (context, func) => {
    return func.resolve();
  });
