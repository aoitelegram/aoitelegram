import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$advancedTextSplit")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .setFields({
    name: "split;index",
    rest: true,
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.String,
  })
  .onCallback(async (context, func) => {
    const [text, ...fields] = await func.resolveFields(context);

    let result = text;
    let currentIndex = 0;
    while (currentIndex < fields.length) {
      let delimiter = fields[currentIndex];
      let position = fields[currentIndex + 1];
      currentIndex += 2;
      position = Number(position) - 1 || 0;
      result = result.split(delimiter)[position] || "";
    }

    return func.resolve(result);
  });
