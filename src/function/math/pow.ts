import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$pow")
  .setBrackets(true)
  .setFields({
    name: "numbers",
    rest: true,
    required: true,
    type: [ArgsType.Number],
  })
  .onCallback(async (context, func) => {
    const numbers = await func.resolveFields(context);
    return func.resolve(numbers.reduce((x, y) => x ** y));
  });
