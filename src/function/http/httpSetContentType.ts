import { HttpID } from "../index";
import { AoiFunction, ArgsType } from "@structures/AoiFunction";

export default new AoiFunction()
  .setName("$httpSetContentType")
  .setBrackets(true)
  .setFields({
    name: "value",
    required: true,
    type: [ArgsType.String],
  })
  .onCallback(async (context, func) => {
    const [type] = await func.resolveFields(context);
    const httpData = context.variable.get(HttpID);
    httpData["contentType"] = type;
    context.variable.set(HttpID, httpData);
    return func.resolve(true);
  });
