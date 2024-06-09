import { memoryUsage } from "node:process";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$ram")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(memoryUsage().heapUsed / 1024 ** 2);
  });
