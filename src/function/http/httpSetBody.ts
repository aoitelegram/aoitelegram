import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpSetBody")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.Object],
  })
  .onCallback(async (context, func) => {
    const [value] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);

    httpData["body"] = JSON.stringify(value);
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
