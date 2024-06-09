import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$floot")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "min",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 100,
  })
  .setFields({
    name: "max",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 100,
  })
  .onCallback(async (context, func) => {
    const [number, min, max] = await func.resolveFields(context);
    return func.resolve(Math.max(min, number) === Math.min(max, number));
  });
