import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$c")
  .setAliases("$comment")
  .setBrackets(true)
  .setFields({
    name: "str",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback((context, func) => {
    return func.resolve();
  });
