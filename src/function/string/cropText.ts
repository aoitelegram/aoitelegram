import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$cropText")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.String],
  })
  .setFields({
    name: "limit",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 2000,
  })
  .setFields({
    name: "start",
    required: false,
    type: [ArgsType.Number],
    defaultValue: 0,
  })
  .setFields({
    name: "char",
    required: false,
    type: [ArgsType.String],
    defaultValue: "",
  })
  .onCallback(async (context, func) => {
    const [text, limit, start, char] = await func.resolveFields(context);

    const result = text.trim().split(char).slice(+start, +limit).join(char);

    return func.resolve(result);
  });
