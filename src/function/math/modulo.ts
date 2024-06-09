import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$modulo")
  .setBrackets(true)
  .setFields({
    name: "numbers",
    rest: true,
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (ctx, func) => {
    const numbers = await func.resolveFields(ctx);
    return func.resolve(numbers.reduce((a, b) => a % b));
  });
