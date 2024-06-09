import process from "node:process";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$nodeVersion")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(process.version);
  });
