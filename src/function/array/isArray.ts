import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$isArray")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [value] = await func.resolveFields(context);

    return func.resolve(Array.isArray(value));
  });
