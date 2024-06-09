import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$isNumber")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.Number,
  })
  .onCallback(async (context, func) => {
    const [number] = await func.resolveFields(context);
    return func.resolve(!isNaN(number));
  });
