import fs from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$dirExists")
  .setAliases(["$fileExists"])
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);

    try {
      await fs.access(path);
      return func.resolve(true);
    } catch {
      return func.resolve(false);
    }
  });
