import process from "node:process";
import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$currentWorkingDirectory")
  .setBrackets(false)
  .onCallback((context, func) => {
    return func.resolve(process.cwd());
  });
