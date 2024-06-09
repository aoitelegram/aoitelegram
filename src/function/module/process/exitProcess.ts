import process from "node:process";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$exitProcess")
  .setBrackets(false)
  .onCallback((context, func) => {
    process.exit();
    return func.resolve();
  });
