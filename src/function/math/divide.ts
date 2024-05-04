import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$divide")
  .setBrackets(true)
  .setFields({
    name: "numbers",
    rest: true,
    type: [ArgsType.Number],
    required: true,
  })
  .onCallback(async (ctx, func) => {
    const numbers = await func.resolveFields(ctx);
    return func.resolve(numbers.reduce((a, b) => a / b));
  });
