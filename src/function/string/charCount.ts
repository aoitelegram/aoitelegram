import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$charCount")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "findChar",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text, findChar] = await func.resolveFields(context);

    if (findChar) {
      const count = (text.split(findChar).length - 1) * findChar.length;
      return func.resolve(count);
    } else {
      return func.resolve(text.length);
    }
  });
