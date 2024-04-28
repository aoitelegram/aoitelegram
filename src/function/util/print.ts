import { AoiFunction } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$print")
  .setBrackets(true)
  .setFields({
    name: "text",
    required: true,
  })
  .onCallback(async (context, func) => {
    console.log(await func.resolveAllFields(context));
    return func.resolve("");
  });
