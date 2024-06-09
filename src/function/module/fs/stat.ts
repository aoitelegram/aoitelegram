import fs from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$statDir")
  .setAliases(["$statFile"])
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);

    return func.resolve(await fs.stat(path));
  });
