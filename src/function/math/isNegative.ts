import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$isNegative")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const [number] = await func.resolveFields(context);
    return func.resolve(number ? number < 0 : false);
  });
