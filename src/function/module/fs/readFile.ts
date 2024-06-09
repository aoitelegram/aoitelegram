import fs from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$readFile")
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);
    const result = await fs.readFile(path, "utf-8");
    return func.resolve(result.toString());
  });
