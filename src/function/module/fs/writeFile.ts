import fs from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$writeFile")
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "content",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path, content] = await func.resolveFields(context);

    await fs.writeFile(path, content, "utf-8");
    return func.resolve(true);
  });
