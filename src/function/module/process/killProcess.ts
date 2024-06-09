import process from "node:process";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$killProcess")
  .setBrackets(false)
  .onCallback((context, func) => {
    process.kill(0);
    return func.resolve();
  });
