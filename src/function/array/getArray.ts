import { ArrayID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$getArray")
  .setBrackets(true)
  .setFields({
    name: "name",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [name] = await func.resolveFields(context);
    return func.resolve(context.variable.get(ArrayID)[name]);
  });
