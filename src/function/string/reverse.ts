import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$reverse")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text] = await func.resolveFields(context);

    const result = text.split("").reverse().join("");
    return func.resolve(result);
  });
