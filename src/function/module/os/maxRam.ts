import os from "node:os";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$maxRam")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve((os.totalmem() / 1024 / 1024).toFixed(2));
  });
