import { randomUUID } from "node:crypto";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$randomUUID")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(randomUUID());
  });
