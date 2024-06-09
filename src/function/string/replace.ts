import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replace")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "replace",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "toReplace",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text, replace, toReplace] = await func.resolveFields(context);

    const result = text.replace(new RegExp(replace, "g"), toReplace);
    return func.resolve(result);
  });
