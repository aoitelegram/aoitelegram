import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$base")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "to",
    required: true,
    type: [ArgsType.Number],
  })
  .setFields({
    name: "from",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 10,
  })
  .onCallback(async (context, func) => {
    const [number, to, from] = await func.resolveFields(context);
    return func.resolve(parseInt(number, from).toString(to));
  });
