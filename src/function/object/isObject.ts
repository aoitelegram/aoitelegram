import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$isObject")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [value] = await func.resolveFields(context);

    return func.resolve(typeof value === "object");
  });
