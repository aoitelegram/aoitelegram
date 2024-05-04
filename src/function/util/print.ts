import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$print")
  .setBrackets(true)
  .setFields({
    name: "args",
    rest: true,
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    console.log(...(await func.resolveFields(context)));
    return func.resolve();
  });
