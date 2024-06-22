import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$numberSeparator")
  .setBrackets(true)
  .setFields({
    name: "number",
    required: true,
    type: [ArgsType.Any],
    converType: ArgsType.Number,
  })
  .setFields({
    name: "sep",
    required: false,
    type: [ArgsType.String],
    defaultValue: ",",
  })
  .onCallback(async (context, func) => {
    const [number, sep] = await func.resolveFields(context);
    const splits = `${number}`.split(".");
    const result = Number(splits[0]).toLocaleString().replace(/\,/g, sep);

    return func.resolve(splits[1] ? `${result}.${splits[1]}` : result);
  });
