import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$return")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: false,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func, code) => {
    if (!code) {
      return func.reject("I don't have access to the code");
    }
    const [value] = await func.resolveFields(context);
    context.stopCode = true;
    return func.resolve(value);
  });
