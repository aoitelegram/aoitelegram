import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replaceAll")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "search",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "toReplace",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text, search, toReplace] = await func.resolveFields(context);

    const regex = new RegExp(search, "g");
    const result = text.replace(regex, toReplace);

    return func.resolve(result);
  });
