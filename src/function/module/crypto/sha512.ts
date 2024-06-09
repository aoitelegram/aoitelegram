import { createHash } from "node:crypto";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$sha512")
  .setBrackets(true)
  .setFields({
    name: "input",
    required: true,
    type: [ArgsType.Any],
  })
  .setFields({
    name: "encoding",
    required: false,
    type: [ArgsType.Any],
    defaultValue: "hex",
  })
  .onCallback(async (context, func) => {
    const [input, encoding] = await func.resolveFields(context);
    return func.resolve(
      createHash("sha512").update(input).digest().toString(encoding),
    );
  });
