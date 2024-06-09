import { isAbsolute } from "node:path";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$isAbsolute")
  .setBrackets(true)
  .setFields({
    name: "path",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [path] = await func.resolveFields(context);

    return func.resolve(isAbsolute(path));
  });
