import process from "node:process";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$uptime")
  .setBrackets(true)
  .onCallback((context, func) => {
    return func.resolve(process.uptime());
  });
