import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$round")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "decimal",
    required: false,
    type: [ArgsType.Number],
    defaultValue: null,
  })
  .onCallback(async (context, func) => {
    const [number, decimal] = await func.resolveFields(context);
    const decimalPlaces = decimal === null ? 1 : Math.pow(10, decimal);

    return func.resolve(Math.round(number * decimalPlaces) / decimalPlaces);
  });
