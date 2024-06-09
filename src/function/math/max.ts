import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$max")
  .setBrackets(true)
  .setFields({
    name: "numbers",
    rest: true,
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const numbers = await func.resolveFields(context);
    return func.resolve(numbers.reduce((a, b) => (a > b ? a : b)));
  });
