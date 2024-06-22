import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$day")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(new Date().getDay());
  });
