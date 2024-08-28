import { escapeCode } from "@aoitelegram/util";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$escapeCode")
  .setBrackets(true)
  .setFields({
    name: "str",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [str] = await func.resolveFields(context);
    return func.resolve(escapeCode(str));
  });
