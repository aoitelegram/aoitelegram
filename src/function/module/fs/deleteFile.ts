import fs from "node:fs/promises";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$deleteFile")
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);

    await fs.unlink(path);
    return func.resolve(true);
  });
