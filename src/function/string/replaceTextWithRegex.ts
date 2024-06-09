import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$replaceTextWithRegex")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "toReplace",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "regex",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "flags",
    required: false,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [text, toReplace, regex, flags = ""] =
      await func.resolveFields(context);

    const regexFlags = new RegExp(regex, flags);
    const result = text.replace(regexFlags, toReplace);

    return func.resolve(result);
  });
