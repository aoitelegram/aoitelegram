import { join } from "node:path";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$joinPath")
  .setBrackets(true)
  .setFields({
    name: "paths",
    rest: true,
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [...paths] = await func.resolveFields(context);
    return func.resolve(join(...paths));
  });
