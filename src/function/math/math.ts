import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$math")
  .setBrackets(true)
  .setFields({
    name: "input",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [input] = await func.resolveFields(context);
    try {
      return func.resolve(eval(input));
    } catch {
      return func.reject("Invalid math expression");
    }
  });
