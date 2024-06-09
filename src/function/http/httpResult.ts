import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpResult")
  .setBrackets(true)
  .setFields({
    name: "variable",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [variable] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID)?.variable;
    return func.resolve(
      httpData["variable"] === variable ? httpData?.result : "undefined",
    );
  });
