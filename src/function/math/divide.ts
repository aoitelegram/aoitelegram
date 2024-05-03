import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$divide")
  .setBrackets(true)
  .setFields({
    name: "numbers",
    required: true,
    rest: true,
  })
  .onCallback(async (ctx, func) => {
    const untypeds: string[] = await func.resolveFields(ctx);
    const numbers = untypeds.map((n) => Number(n));
    if (numbers.some((n) => isNaN(n)))
      return func.reject(`Invalid number at: "${func.structures.name}"`, true);
    return func.resolve(numbers.reduce((a, b) => a / b));
  });
