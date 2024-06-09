import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$encodeURIComponent")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.Any],
  })
  .onCallback(async (context, func) => {
    const [text] = await func.resolveFields(context);
    return func.resolve(encodeURIComponent(text));
  });
